"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  try {
    const categories = await prisma.transactionCategory.findMany( {
      orderBy : { name : "asc" },
    } );
    
    return { success : true, categories };
  } catch ( error: any ) {
    return { success : false, error : error.message };
  }
}

export async function getFeeRules() {
  try {
    const rules = await prisma.feeRule.findMany( {
      include : { category : true },
      orderBy : { createdAt : "desc" },
    } );
    
    return { success : true, rules };
  } catch ( error: any ) {
    return { success : false, error : error.message };
  }
}

export async function createFeeRule( data: {
  categoryId: string;
  name: string;
  minAmount?: number | null;
  maxAmount?: number | null;
  formulaJson: any;
} ) {
  try {
    const rule = await prisma.feeRule.create( {
      data : {
        ...data,
      },
    } );
    revalidatePath( "/fee-rules" );
    
    return { success : true, rule };
  } catch ( error: any ) {
    return { success : false, error : error.message };
  }
}

export async function deleteFeeRule( id: string ) {
  try {
    await prisma.feeRule.delete( { where : { id } } );
    revalidatePath( "/fee-rules" );
    
    return { success : true };
  } catch ( error: any ) {
    return { success : false, error : error.message };
  }
}

export async function duplicateFeeRule( id: string ) {
  try {
    const existingRule = await prisma.feeRule.findUnique( { where : { id } } );
    if ( !existingRule ) throw new Error( "Rule not found" );

    const newRule = await prisma.feeRule.create( {
      data : {
        categoryId  : existingRule.categoryId,
        name        : `${existingRule.name} (Copy)`,
        minAmount   : existingRule.minAmount,
        maxAmount   : existingRule.maxAmount,
        formulaJson : existingRule.formulaJson as any,
        isActive    : existingRule.isActive,
      },
    } );
    revalidatePath( "/fee-rules" );
    
    return { success : true, rule : newRule };
  } catch ( error: any ) {
    return { success : false, error : error.message };
  }
}

export async function updateFeeRule( id: string, data: {
  categoryId: string;
  name: string;
  minAmount?: number | null;
  maxAmount?: number | null;
  formulaJson: any;
} ) {
  try {
    const rule = await prisma.feeRule.update( {
      where : { id },
      data  : {
        ...data,
      },
    } );
    revalidatePath( "/fee-rules" );
    
    return { success : true, rule };
  } catch ( error: any ) {
    return { success : false, error : error.message };
  }
}
