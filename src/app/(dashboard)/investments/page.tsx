import { getInvestments } from "@/actions/investments";
import { InvestmentsTable } from "@/components/features/investments/investments-table";
import { InvestmentFormDialog } from "@/components/features/investments/investment-form-dialog";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TransitionWrapper } from "@/components/layout/transition-wrapper";

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
    <TransitionWrapper>
      <div className="space-y-6">
        <div className="animate-item flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Investasi Harian</h2>
            <p className="text-muted-foreground">
              Pantau penambahan modal saldo BRILink Anda.
            </p>
          </div>
          <InvestmentFormDialog />
        </div>
        <div className="animate-item">
          <InvestmentsTable investments={investments || []} />
        </div>
      </div>
    </TransitionWrapper>
  );
}
