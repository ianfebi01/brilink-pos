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

  // 4. Create sample transactions for the entire current month
  const transactionData = []
  const now = new Date()

  // Get current date in Jakarta timezone
  const jakartaFormatter = new Intl.DateTimeFormat( 'en-CA', { timeZone : 'Asia/Jakarta' } )
  const todayStr = jakartaFormatter.format( now ) // YYYY-MM-DD
  const [yearStr, monthStr, dayStr] = todayStr.split( '-' )
  const currentYear = parseInt( yearStr )
  const currentMonth = parseInt( monthStr )
  const todayDay = parseInt( dayStr )

  const customerNames = [
    'Budi Santoso', 'Siti Rahayu', 'Ahmad Fauzi', 'Dewi Lestari',
    'Eko Prasetyo', 'Fitri Handayani', 'Gunawan Wijaya', 'Hesti Purnama',
    'Irfan Hakim', 'Joko Widodo', 'Kartini Sari', 'Lukman Hakim',
    'Maya Anggraeni', 'Nanda Pratama', 'Oki Setiawan', 'Putri Ayu',
  ]
  
  for ( let day = 1; day <= todayDay; day++ ) {
    // Create a Jakarta timezone date string for this day
    const dateStr = `${currentYear}-${String( currentMonth ).padStart( 2, '0' )}-${String( day ).padStart( 2, '0' )}`
    
    // Random number of transactions between 3 and 12 per day
    const transactionsPerDay = 3 + Math.floor( Math.random() * 10 )
    
    for ( let j = 0; j < transactionsPerDay; j++ ) {
      // Random hour between 8 AM and 9 PM in Jakarta time
      const hour = 8 + Math.floor( Math.random() * 13 )
      const minute = Math.floor( Math.random() * 60 )
      const second = Math.floor( Math.random() * 60 )
      const transactionDate = new Date( `${dateStr}T${String( hour ).padStart( 2, '0' )}:${String( minute ).padStart( 2, '0' )}:${String( second ).padStart( 2, '0' )}+07:00` )
      
      const isTransfer = Math.random() > 0.4
      const category = isTransfer ? catTransfer : catTarikTunai
      const rule = isTransfer ? ruleTransfer : ruleTarikTunai
      
      // Varied amounts: 50k to 2M
      const amounts = [50000, 100000, 150000, 200000, 300000, 500000, 750000, 1000000, 1500000, 2000000]
      const amount = amounts[Math.floor( Math.random() * amounts.length )]
      
      // Fee structure depends on amount tier
      let customerFee: number, briFee: number
      if ( amount <= 100000 ) {
        customerFee = 5000
        briFee = 3000
      } else if ( amount <= 500000 ) {
        customerFee = 5000
        briFee = 2500
      } else {
        customerFee = 10000
        briFee = 5000
      }
      const agentProfit = customerFee - briFee
      
      transactionData.push( {
        categoryId        : category.id,
        feeRuleId         : rule.id,
        transactionAmount : amount,
        customerFee,
        briFee,
        agentProfit,
        totalPaid         : amount + customerFee,
        customerName      : customerNames[Math.floor( Math.random() * customerNames.length )],
        note              : isTransfer ? `Transfer ke rek tujuan` : `Tarik tunai nasabah`,
        createdById       : Math.random() > 0.3 ? admin.id : staff.id,
        createdAt         : transactionDate,
      } )
    }
  }

  await prisma.transaction.createMany( {
    data : transactionData
  } )
  console.log( `Created ${transactionData.length} sample transactions for ${todayDay} days in ${monthStr}/${yearStr}` )

  // 5. Create daily investments for this month
  const investmentData = []
  for ( let day = 1; day <= todayDay; day++ ) {
    const dateStr = `${currentYear}-${String( currentMonth ).padStart( 2, '0' )}-${String( day ).padStart( 2, '0' )}`
    // Investment amounts between 500k and 5M
    const investmentAmounts = [500000, 1000000, 1500000, 2000000, 2500000, 3000000, 5000000]
    const amount = investmentAmounts[Math.floor( Math.random() * investmentAmounts.length )]

    investmentData.push( {
      amount,
      note           : `Modal harian ${day}/${currentMonth}`,
      investmentDate : new Date( `${dateStr}T00:00:00+07:00` ),
      createdById    : admin.id,
      createdAt      : new Date( `${dateStr}T07:00:00+07:00` ),
    } )
  }

  await prisma.dailyInvestment.createMany( {
    data : investmentData
  } )
  console.log( `Created ${investmentData.length} daily investments` )
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
