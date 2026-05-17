"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function checkSuperAdmin() {
  const session = await getServerSession( authOptions );
  if ( ( session?.user as any )?.role !== "superadmin" ) {
    throw new Error( "Unauthorized: Super Admin access required" );
  }
}

export async function getCategories() {
  try {
    const categories = await prisma.transactionCategory.findMany( {
      orderBy : { name : "asc" },
    } );
    
    return { success : true, categories : JSON.parse( JSON.stringify( categories ) ) };
  } catch ( error: any ) {
    return { success : false, error : error.message };
  }
}

export async function getFeeRules() {
  try {
    const rules = await prisma.feeRule.findMany( {
      select : {
        id          : true,
        name        : true,
        formulaJson : true,
        isActive    : true,
        categoryId  : true,
        category    : true,
        createdAt   : true,
      },
      orderBy : { createdAt : "desc" },
    } );
    
    return { success : true, rules : JSON.parse( JSON.stringify( rules ) ) };
  } catch ( error: any ) {
    return { success : false, error : error.message };
  }
}

export async function createFeeRule( data: {
  categoryId: string;
  name: string;
  formulaJson: any[]; // Array of tiers
} ) {
  try {
    await checkSuperAdmin();
    // 1. Check for category uniqueness
    const existing = await prisma.feeRule.findUnique( {
      where : { categoryId : data.categoryId },
    } );
    if ( existing ) {
      throw new Error( "A fee rule already exists for this category." );
    }

    // 2. Validate tiers
    validateTiers( data.formulaJson );

    const rule = await prisma.feeRule.create( {
      data : {
        categoryId  : data.categoryId,
        name        : data.name,
        formulaJson : data.formulaJson,
      },
    } );
    revalidatePath( "/fee-rules" );
    
    return { success : true, rule : JSON.parse( JSON.stringify( rule ) ) };
  } catch ( error: any ) {
    return { success : false, error : error.message };
  }
}

function validateTiers( tiers: any[] ) {
  if ( !Array.isArray( tiers ) || tiers.length === 0 ) {
    throw new Error( "At least one tier is required." );
  }

  const sorted = [...tiers].sort( ( a, b ) => Number( a.minAmount ) - Number( b.minAmount ) );
  for ( let i = 0; i < sorted.length - 1; i++ ) {
    const currentMax = Number( sorted[i].maxAmount );
    const nextMin = Number( sorted[i + 1].minAmount );
    if ( currentMax >= nextMin ) {
      throw new Error( `Tier ranges overlap: ${currentMax} and ${nextMin}` );
    }
  }
}

export async function deleteFeeRule( id: string ) {
  try {
    await checkSuperAdmin();
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
        categoryId  : `copy-${Date.now()}-${existingRule.categoryId}`.substring(0, 30), // Temp unique id
        name        : `${existingRule.name} (Copy)`,
        formulaJson : existingRule.formulaJson as any,
        isActive    : existingRule.isActive,
      },
    } );
    revalidatePath( "/fee-rules" );
    
    return { success : true, rule : JSON.parse( JSON.stringify( newRule ) ) };
  } catch ( error: any ) {
    return { success : false, error : error.message };
  }
}

export async function updateFeeRule( id: string, data: {
  categoryId: string;
  name: string;
  formulaJson: any[];
} ) {
  try {
    await checkSuperAdmin();
    // Validate tiers
    validateTiers( data.formulaJson );

    const rule = await prisma.feeRule.update( {
      where : { id },
      data  : {
        categoryId  : data.categoryId,
        name        : data.name,
        formulaJson : data.formulaJson,
      },
    } );
    revalidatePath( "/fee-rules" );
    
    return { success : true, rule : JSON.parse( JSON.stringify( rule ) ) };
  } catch ( error: any ) {
    return { success : false, error : error.message };
  }
}
