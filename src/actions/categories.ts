"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as z from "zod";

const categorySchema = z.object( {
  name : z.string().min( 2 ).max( 50 ),
} );

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

export async function createCategory( data: { name: string } ) {
  try {
    await checkSuperAdmin();
    categorySchema.parse( data );
    
    // Generate a simple code/slug from name
    const code = data.name.toLowerCase().replace( /[^a-z0-9]+/g, "-" ).replace( /^-+|-+$/g, "" ) || `cat-${Date.now()}`;

    const category = await prisma.transactionCategory.create( {
      data : {
        name : data.name,
        code,
      },
    } );
    revalidatePath( "/categories" );
    revalidatePath( "/fee-rules" );
    revalidatePath( "/transactions" );
    
    return { success : true, category : JSON.parse( JSON.stringify( category ) ) };
  } catch ( error: any ) {
    return { success : false, error : error.message };
  }
}

export async function updateCategory( id: string, data: { name: string } ) {
  try {
    await checkSuperAdmin();
    categorySchema.parse( data );

    const category = await prisma.transactionCategory.update( {
      where : { id },
      data,
    } );
    revalidatePath( "/categories" );
    revalidatePath( "/fee-rules" );
    revalidatePath( "/transactions" );
    
    return { success : true, category : JSON.parse( JSON.stringify( category ) ) };
  } catch ( error: any ) {
    return { success : false, error : error.message };
  }
}

export async function deleteCategory( id: string ) {
  try {
    await checkSuperAdmin();
    // Check if there are any transactions or fee rules using this category
    const txCount = await prisma.transaction.count( { where : { categoryId : id } } );
    const ruleCount = await prisma.feeRule.count( { where : { categoryId : id } } );
    
    if ( txCount > 0 || ruleCount > 0 ) {
      throw new Error( "Kategori tidak bisa dihapus karena masih digunakan dalam transaksi atau aturan fee." );
    }

    await prisma.transactionCategory.delete( { where : { id } } );
    revalidatePath( "/categories" );
    
    return { success : true };
  } catch ( error: any ) {
    return { success : false, error : error.message };
  }
}
