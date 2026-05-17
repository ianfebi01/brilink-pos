import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.count()
  const categories = await prisma.transactionCategory.count()
  const rules = await prisma.feeRule.count()
  const transactions = await prisma.transaction.count()
  
  console.log( { users, categories, rules, transactions } )
  
  const sampleRule = await prisma.feeRule.findFirst( { include : { category : true } } )
  console.log( 'Sample Rule:', JSON.stringify( sampleRule, null, 2 ) )
}

main().finally( () => prisma.$disconnect() )
