import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// simple hash function matching what we'll use in next-auth credentials provider
function hashPassword( password: string ) {
  return crypto.createHash( 'sha256' ).update( password ).digest( 'hex' )
}

async function main() {
  // 1. Create superadmin
  const admin = await prisma.user.upsert( {
    where  : { username : 'admin' },
    update : {},
    create : {
      username : 'admin',
      password : hashPassword( 'admin123' ), // Basic hash for MVP
      name     : 'Super Admin',
      role     : 'superadmin',
    },
  } )
  console.log( `Created admin user: ${admin.username}` )

  const staff = await prisma.user.upsert( {
    where  : { username : 'staff' },
    update : {},
    create : {
      username : 'staff',
      password : hashPassword( 'staff123' ),
      name     : 'Regular Staff',
      role     : 'admin',
    },
  } )
  console.log( `Created staff user: ${staff.username}` )

  // 2. Create Categories
  const catTransfer = await prisma.transactionCategory.upsert( {
    where  : { code : 'TRF_BRI' },
    update : {},
    create : {
      name        : 'Transfer Sesama BRI',
      code        : 'TRF_BRI',
      description : 'Transfer ke rekening BRI lain',
    },
  } )
  
  const catTarikTunai = await prisma.transactionCategory.upsert( {
    where  : { code : 'TARIK_TUNAI' },
    update : {},
    create : {
      name        : 'Tarik Tunai',
      code        : 'TARIK_TUNAI',
      description : 'Tarik tunai dari rekening nasabah',
    },
  } )
  console.log( `Created categories` )

  // 3. Create Example Fee Rules
  const ruleTransfer = await prisma.feeRule.create( {
    data : {
      categoryId  : catTransfer.id,
      name        : 'Standard Transfer Fee',
      minAmount   : 1,
      maxAmount   : 10000000,
      formulaJson : {
        customer_fee : { type : "fixed", value : 5000 },
        bri_fee      : { type : "fixed", value : 2500 },
        agent_profit : { type : "formula", expression : "customer_fee - bri_fee" },
        total_paid   : { type : "formula", expression : "amount + customer_fee" }
      }
    }
  } )
  const ruleTarikTunai = await prisma.feeRule.create( {
    data : {
      categoryId  : catTarikTunai.id,
      name        : 'Tarik Tunai 10k-100k',
      minAmount   : 10000,
      maxAmount   : 100000,
      formulaJson : {
        customer_fee : { type : "fixed", value : 5000 },
        bri_fee      : { type : "fixed", value : 3000 },
        agent_profit : { type : "formula", expression : "customer_fee - bri_fee" },
        total_paid   : { type : "formula", expression : "amount + customer_fee" }
      }
    }
  } )
  console.log( `Created fee rules` )

  // 4. Create sample transactions (optional)
  await prisma.transaction.createMany( {
    data : [
      {
        categoryId        : catTransfer.id,
        feeRuleId         : ruleTransfer.id,
        transactionAmount : 100000,
        customerFee       : 5000,
        briFee            : 2500,
        agentProfit       : 2500,
        totalPaid         : 105000,
        customerName      : 'Budi Santoso',
        note              : 'Transfer ke rekening istri',
        createdById       : admin.id
      },
      {
        categoryId        : catTransfer.id,
        feeRuleId         : ruleTransfer.id,
        transactionAmount : 500000,
        customerFee       : 5000,
        briFee            : 2500,
        agentProfit       : 2500,
        totalPaid         : 505000,
        customerName      : 'Siti Aminah',
        note              : 'Bayar cicilan',
        createdById       : admin.id
      },
      {
        categoryId        : catTarikTunai.id,
        feeRuleId         : ruleTarikTunai.id,
        transactionAmount : 50000,
        customerFee       : 5000,
        briFee            : 3000,
        agentProfit       : 2000,
        totalPaid         : 55000,
        customerName      : 'Andi Setiawan',
        note              : 'Tarik tunai uang saku',
        createdById       : admin.id
      },
      {
        categoryId        : catTarikTunai.id,
        feeRuleId         : ruleTarikTunai.id,
        transactionAmount : 100000,
        customerFee       : 5000,
        briFee            : 3000,
        agentProfit       : 2000,
        totalPaid         : 105000,
        customerName      : 'Rina Maryana',
        note              : 'Tarik tunai belanja',
        createdById       : admin.id
      }
    ]
  } )
  console.log( `Created sample transactions` )
}

main()
  .then( async () => {
    await prisma.$disconnect()
  } )
  .catch( async ( e ) => {
    console.error( e )
    await prisma.$disconnect()
    process.exit( 1 )
  } )
