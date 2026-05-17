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

export async function getTransactions( limit = 50, offset = 0 ) {
  try {
    const session = await getServerSession( authOptions );
    const userRole = ( session?.user as any )?.role;

    let where = {};
    if ( userRole === "admin" ) {
      const today = new Date();
      today.setHours( 0, 0, 0, 0 );
      where = { createdAt : { gte : today } };
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
  } catch ( error: any ) {
    return { success : false, error : error.message };
  }
}

export async function getDashboardStats() {
  const today = new Date();
  today.setHours( 0, 0, 0, 0 );

  const [
    todayTransactionsCount,
    todayIncomeSum,
    todayTxSum,
    todayInvestmentsSum,
  ] = await Promise.all( [
    prisma.transaction.count( {
      where : { createdAt : { gte : today } },
    } ),
    prisma.transaction.aggregate( {
      where : { createdAt : { gte : today } },
      _sum  : { agentProfit : true },
    } ),
    prisma.transaction.aggregate( {
      where : { createdAt : { gte : today } },
      _sum  : { transactionAmount : true },
    } ),
    prisma.dailyInvestment.aggregate( {
      where : { investmentDate : { gte : today } },
      _sum  : { amount : true },
    } ),
  ] );

  return {
    success : true,
    data    : {
      transactionsCount      : todayTransactionsCount,
      totalIncome            : Number( todayIncomeSum._sum.agentProfit || 0 ),
      totalTransactionAmount : Number( todayTxSum._sum.transactionAmount || 0 ),
      totalInvestments       : Number( todayInvestmentsSum._sum.amount || 0 ),
    },
  };
}
