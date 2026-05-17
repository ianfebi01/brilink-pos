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

  if ( !txRes.success ) return <div className="p-4 text-red-500 bg-red-50 border border-red-200 rounded-md">Error loading transactions: {txRes.error}</div>;
  if ( !catRes.success ) return <div className="p-4 text-red-500 bg-red-50 border border-red-200 rounded-md">Error loading categories: {catRes.error}</div>;
  if ( !ruleRes.success ) return <div className="p-4 text-red-500 bg-red-50 border border-red-200 rounded-md">Error loading fee rules: {ruleRes.error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transaksi</h2>
          <p className="text-muted-foreground">
            Kelola transaksi harian Anda di sini.
          </p>
        </div>
        <TransactionFormDialog 
          categories={catRes.categories || []} 
          feeRules={ruleRes.rules || []} 
          recentTransactions={( txRes.transactions || [] ).slice( 0, 5 )}
        />
      </div>
      <TransactionTable transactions={txRes.transactions || []} />
    </div>
  );
}
