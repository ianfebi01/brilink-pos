"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getInvestments() {
  try {
    const investments = await prisma.dailyInvestment.findMany( {
      orderBy : { investmentDate : "desc" },
      include : { createdBy : true },
    } );
    
    const serializedInvestments = investments.map( ( inv ) => ( {
      ...inv,
      amount : Number( inv.amount ),
    } ) );
    
    return { success : true, investments : serializedInvestments };
  } catch ( error: any ) {
    return { success : false, error : error.message };
  }
}

export async function createInvestment( data: {
  amount: number;
  note?: string;
  investmentDate: Date;
  createdById: string;
} ) {
  try {
    const investment = await prisma.dailyInvestment.create( {
      data,
    } );
    revalidatePath( "/investments" );
    revalidatePath( "/" );
    
    return { 
      success     : true, 
      investment : JSON.parse( JSON.stringify( investment ) ) 
    };
  } catch ( error: any ) {
    return { success : false, error : error.message };
  }
}
