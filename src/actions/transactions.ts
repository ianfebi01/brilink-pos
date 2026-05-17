"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as z from "zod";

const transactionSchema = z.object( {
  categoryId        : z.string().min( 1 ),
  feeRuleId         : z.string().optional(),
  transactionAmount : z.number().positive(),
  customerFee       : z.number().nonnegative(),
  briFee            : z.number().nonnegative(),
  agentProfit       : z.number(),
  totalPaid         : z.number().positive(),
  customerName      : z.string().optional(),
  note              : z.string().optional(),
  createdById       : z.string().min( 1 ),
} );

export async function createTransaction( data: {
  categoryId: string;
  feeRuleId?: string;
  transactionAmount: number;
  customerFee: number;
  briFee: number;
  agentProfit: number;
  totalPaid: number;
  customerName?: string;
  note?: string;
  createdById: string;
} ) {
  try {
    transactionSchema.parse( data );
    const transaction = await prisma.transaction.create( {
      data,
    } );
    revalidatePath( "/transactions" );
    revalidatePath( "/" );
    
    return { 
      success     : true, 
      transaction : {
        ...transaction,
        transactionAmount : Number( transaction.transactionAmount ),
        customerFee       : Number( transaction.customerFee ),
        briFee            : Number( transaction.briFee ),
        agentProfit       : Number( transaction.agentProfit ),
        totalPaid         : Number( transaction.totalPaid ),
      }
    };
  } catch ( error: any ) {
    // eslint-disable-next-line no-console
    console.error( error );
    
    return { success : false, error : error.message };
  }
}

export async function getTransactions( limit = 50, offset = 0, query?: string, from?: string, to?: string ) {
  try {
    const session = await getServerSession( authOptions );
    const userRole = ( session?.user as any )?.role;

    let where: any = {};
    
    if ( query ) {
      where.OR = [
        { customerName : { contains : query, mode : "insensitive" } },
        { note : { contains : query, mode : "insensitive" } },
      ];
    }

    if ( from || to ) {
      where.createdAt = {
        ...( from && { gte : new Date( `${from}T00:00:00+07:00` ) } ),
        ...( to && { lte : new Date( `${to}T23:59:59+07:00` ) } ),
      };
    } else if ( userRole === "admin" ) {
      // Default to today for admins if no date range is specified
      const now = new Date();
      const jakartaDateStr = new Intl.DateTimeFormat( "en-CA", { timeZone : "Asia/Jakarta" } ).format( now );
      const todayStart = new Date( `${jakartaDateStr}T00:00:00+07:00` );
      
      where.createdAt = { gte : todayStart };
    }

    const [transactions, total] = await Promise.all( [
      prisma.transaction.findMany( {
        where,
        take    : limit,
        skip    : offset,
        orderBy : { createdAt : "desc" },
        include : {
          category  : true,
          createdBy : true,
          feeRule   : {
            select : {
              id          : true,
              name        : true,
              formulaJson : true,
              isActive    : true,
            },
          },
        },
      } ),
      prisma.transaction.count( { where } ),
    ] );

    const serializedTransactions = transactions.map( ( tx ) => ( {
      ...tx,
      transactionAmount : Number( tx.transactionAmount ),
      customerFee       : Number( tx.customerFee ),
      briFee            : Number( tx.briFee ),
      agentProfit       : Number( tx.agentProfit ),
      totalPaid         : Number( tx.totalPaid ),
    } ) );
    
    return { success : true, transactions : serializedTransactions, total };
  } catch ( error : any ) {
    console.error( error );
    
    return { success : false, error : error.message };
  }
}

export async function getDashboardStats( period: "daily" | "monthly" = "daily" ) {
  const now = new Date();
  
  // Format current date in Asia/Jakarta
  const jakartaDateStr = new Intl.DateTimeFormat( "en-CA", { timeZone : "Asia/Jakarta" } ).format( now );
  
  // 00:00:00 Today in Asia/Jakarta
  const todayStart = new Date( `${jakartaDateStr}T00:00:00+07:00` );

  // 00:00:00 First day of current month in Asia/Jakarta
  const startOfMonth = new Date( todayStart );
  startOfMonth.setDate( 1 );

  const startDate = period === "daily" ? todayStart : startOfMonth;
  
  // For chart: 7 days for daily, 30 days for monthly
  const chartStartDate = new Date( todayStart );
  chartStartDate.setDate( todayStart.getDate() - ( period === "daily" ? 7 : 30 ) );

  const [
    transactionsCount,
    incomeSum,
    txSum,
    investmentsSum,
    recentTransactions,
    dailyChartDataRaw,
  ] = await Promise.all( [
    prisma.transaction.count( {
      where : { createdAt : { gte : startDate } },
    } ),
    prisma.transaction.aggregate( {
      where : { createdAt : { gte : startDate } },
      _sum  : { agentProfit : true },
    } ),
    prisma.transaction.aggregate( {
      where : { createdAt : { gte : startDate } },
      _sum  : { transactionAmount : true },
    } ),
    prisma.dailyInvestment.aggregate( {
      where : { investmentDate : { gte : startDate } },
      _sum  : { amount : true },
    } ),
    prisma.transaction.findMany( {
      take    : 5,
      orderBy : { createdAt : "desc" },
      include : { category : true },
    } ),
    prisma.transaction.groupBy( {
      by    : ["createdAt"],
      where : { createdAt : { gte : chartStartDate } },
      _sum  : { 
        agentProfit       : true,
        transactionAmount : true 
      },
    } ),
  ] );

  // Process chart data using local timezone (Asia/Jakarta)
  const chartDataMap = new Map();
  const dateFormatter = new Intl.DateTimeFormat( "en-CA", {
    timeZone : "Asia/Jakarta",
    year     : "numeric",
    month    : "2-digit",
    day      : "2-digit",
  } );

  dailyChartDataRaw.forEach( ( item ) => {
    // dateFormatter.format returns YYYY-MM-DD for en-CA
    const dateStr = dateFormatter.format( item.createdAt );
    const existing = chartDataMap.get( dateStr ) || { income : 0, volume : 0 };
    chartDataMap.set( dateStr, {
      income : existing.income + Number( item._sum.agentProfit || 0 ),
      volume : existing.volume + Number( item._sum.transactionAmount || 0 ),
    } );
  } );

  const chartData = Array.from( chartDataMap.entries() )
    .map( ( [date, data] ) => ( {
      date,
      income : data.income,
      volume : data.volume,
    } ) )
    .sort( ( a, b ) => a.date.localeCompare( b.date ) );

  return {
    success : true,
    data    : {
      transactionsCount      : transactionsCount,
      totalIncome            : Number( incomeSum._sum.agentProfit || 0 ),
      totalTransactionAmount : Number( txSum._sum.transactionAmount || 0 ),
      totalInvestments       : Number( investmentsSum._sum.amount || 0 ),
      remainingInvestment    : Number( investmentsSum._sum.amount || 0 ) - Number( txSum._sum.transactionAmount || 0 ),
      recentTransactions,
      chartData,
    },
  };
}
