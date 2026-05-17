"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
    const transaction = await prisma.transaction.create( {
      data,
    } );
    revalidatePath( "/transactions" );
    revalidatePath( "/" );
    
    return { success : true, transaction };
  } catch ( error: any ) {
    console.error( error );
    
    return { success : false, error : error.message };
  }
}

export async function getTransactions( limit = 10, offset = 0 ) {
  try {
    const [transactions, total] = await Promise.all( [
      prisma.transaction.findMany( {
        take    : limit,
        skip    : offset,
        orderBy : { createdAt : "desc" },
        include : {
          category  : true,
          createdBy : true,
          feeRule   : true,
        },
      } ),
      prisma.transaction.count(),
    ] );
    
    return { success : true, transactions, total };
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
