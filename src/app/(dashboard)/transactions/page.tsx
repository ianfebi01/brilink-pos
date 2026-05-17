import { getTransactions } from "@/actions/transactions";
import { getFeeRules, getCategories } from "@/actions/fee-rules";
import { TransactionTable } from "@/components/features/transactions/transaction-table";
import { TransactionFormDialog } from "@/components/features/transactions/transaction-form-dialog";

export default async function TransactionsPage() {
  const [txRes, catRes, ruleRes] = await Promise.all( [
    getTransactions( 50, 0 ),
    getCategories(),
    getFeeRules()
  ] );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground">
            Manage your daily transactions here.
          </p>
        </div>
        <TransactionFormDialog 
          categories={catRes.categories || []} 
          feeRules={ruleRes.rules || []} 
        />
      </div>
      <TransactionTable transactions={txRes.transactions || []} />
    </div>
  );
}
