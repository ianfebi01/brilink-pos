/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// simple hash function matching what we'll use in next-auth credentials provider
function hashPassword( password: string ) {
  return crypto.createHash( 'sha256' ).update( password ).digest( 'hex' )
}

async function main() {
  // 0. Clean slate for re-seeding
  await prisma.transaction.deleteMany()
  await prisma.dailyInvestment.deleteMany()
  
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
  const ruleTransfer = await prisma.feeRule.upsert( {
    where  : { categoryId : catTransfer.id },
    update : {
      name        : 'Standard Transfer Fee',
      formulaJson : [
        {
          minAmount : 0,
          maxAmount : 10000000,
          formulas  : {
            customer_fee : { type : "fixed", value : 5000 },
            bri_fee      : { type : "fixed", value : 2500 },
            agent_profit : { type : "formula", expression : "customer_fee - bri_fee" },
            total_paid   : { type : "formula", expression : "amount + customer_fee" }
          }
        }
      ]
    },
    create : {
      categoryId  : catTransfer.id,
      name        : 'Standard Transfer Fee',
      formulaJson : [
        {
          minAmount : 0,
          maxAmount : 10000000,
          formulas  : {
            customer_fee : { type : "fixed", value : 5000 },
            bri_fee      : { type : "fixed", value : 2500 },
            agent_profit : { type : "formula", expression : "customer_fee - bri_fee" },
            total_paid   : { type : "formula", expression : "amount + customer_fee" }
          }
        }
      ]
    }
  } )
  
  const ruleTarikTunai = await prisma.feeRule.upsert( {
    where  : { categoryId : catTarikTunai.id },
    update : {
      name        : 'Tarik Tunai Rules',
      formulaJson : [
        {
          minAmount : 10000,
          maxAmount : 100000,
          formulas  : {
            customer_fee : { type : "fixed", value : 5000 },
            bri_fee      : { type : "fixed", value : 3000 },
            agent_profit : { type : "formula", expression : "customer_fee - bri_fee" },
            total_paid   : { type : "formula", expression : "amount + customer_fee" }
          }
        },
        {
          minAmount : 100001,
          maxAmount : 1000000,
          formulas  : {
            customer_fee : { type : "fixed", value : 10000 },
            bri_fee      : { type : "fixed", value : 5000 },
            agent_profit : { type : "formula", expression : "customer_fee - bri_fee" },
            total_paid   : { type : "formula", expression : "amount + customer_fee" }
          }
        }
      ]
    },
    create : {
      categoryId  : catTarikTunai.id,
      name        : 'Tarik Tunai Rules',
      formulaJson : [
        {
          minAmount : 10000,
          maxAmount : 100000,
          formulas  : {
            customer_fee : { type : "fixed", value : 5000 },
            bri_fee      : { type : "fixed", value : 3000 },
            agent_profit : { type : "formula", expression : "customer_fee - bri_fee" },
            total_paid   : { type : "formula", expression : "amount + customer_fee" }
          }
        },
        {
          minAmount : 100001,
          maxAmount : 1000000,
          formulas  : {
            customer_fee : { type : "fixed", value : 10000 },
            bri_fee      : { type : "fixed", value : 5000 },
            agent_profit : { type : "formula", expression : "customer_fee - bri_fee" },
            total_paid   : { type : "formula", expression : "amount + customer_fee" }
          }
        }
      ]
    }
  } )
  console.log( `Created fee rules` )

  // 4. Create sample transactions (10 per day for last 7 days)
  const transactionData = []
  const now = new Date()
  
  for ( let i = 0; i < 7; i++ ) {
    const day = new Date( now )
    day.setDate( now.getDate() - i )
    
    // Random number of transactions between 5 and 20 per day
    const transactionsPerDay = 5 + Math.floor( Math.random() * 16 )
    
    for ( let j = 0; j < transactionsPerDay; j++ ) {
      const transactionDate = new Date( day )
      // Random hour between 8 AM and 9 PM
      transactionDate.setHours( 8 + Math.floor( Math.random() * 13 ), Math.floor( Math.random() * 60 ), 0, 0 )
      
      const isTransfer = Math.random() > 0.5
      const category = isTransfer ? catTransfer : catTarikTunai
      const rule = isTransfer ? ruleTransfer : ruleTarikTunai
      const amount = 100000 + ( Math.floor( Math.random() * 10 ) * 100000 )
      
      transactionData.push( {
        categoryId        : category.id,
        feeRuleId         : rule.id,
        transactionAmount : amount,
        customerFee       : 5000,
        briFee            : 2500,
        agentProfit       : 2500,
        totalPaid         : amount + 5000,
        customerName      : `Nasabah ${i}-${j}`,
        note              : `Transaksi otomatis ${i}-${j}`,
        createdById       : admin.id,
        createdAt         : transactionDate
      } )
    }
  }

  await prisma.transaction.createMany( {
    data : transactionData
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
