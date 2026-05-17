"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getInvestments() {
  try {
    const investments = await prisma.dailyInvestment.findMany( {
      orderBy : { investmentDate : "desc" },
      include : { createdBy : true },
    } );
    
    return { success : true, investments };
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
    
    return { success : true, investment };
  } catch ( error: any ) {
    return { success : false, error : error.message };
  }
}
