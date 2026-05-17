import { getInvestments } from "@/actions/investments";
import { InvestmentsTable } from "@/components/features/investments/investments-table";
import { InvestmentFormDialog } from "@/components/features/investments/investment-form-dialog";

export default async function InvestmentsPage() {
  const { investments } = await getInvestments();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Daily Investments</h2>
          <p className="text-muted-foreground">
            Track capital additions to your BRILink agent balance.
          </p>
        </div>
        <InvestmentFormDialog />
      </div>
      <InvestmentsTable investments={investments || []} />
    </div>
  );
}
