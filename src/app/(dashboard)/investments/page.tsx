import { getInvestments } from "@/actions/investments";
import { InvestmentsTable } from "@/components/features/investments/investments-table";
import { InvestmentFormDialog } from "@/components/features/investments/investment-form-dialog";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function InvestmentsPage() {
  const session = await getServerSession( authOptions );
  if ( ( session?.user as any )?.role !== "superadmin" ) {
    redirect( "/" );
  }

  const res = await getInvestments();
  if ( !res.success ) {
    return (
      <div className="p-4 text-red-500 bg-red-50 border border-red-200 rounded-md">
        Error loading investments: {res.error}
      </div>
    );
  }

  const { investments } = res;

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
