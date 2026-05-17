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

export async function getInvestments() {
  try {
    await checkSuperAdmin();
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
    await checkSuperAdmin();
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
