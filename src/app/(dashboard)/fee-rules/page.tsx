import { getCategories, getFeeRules } from "@/actions/fee-rules";
import { FeeRulesTable } from "@/components/features/fee-rules/fee-rules-table";
import { FeeRuleFormDialog } from "@/components/features/fee-rules/fee-rule-form-dialog";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function FeeRulesPage() {
  const session = await getServerSession( authOptions );
  if ( ( session?.user as any )?.role !== "superadmin" ) {
    redirect( "/" );
  }

  const [rulesRes, catRes] = await Promise.all( [
    getFeeRules(),
    getCategories()
  ] );

  if ( !rulesRes.success ) return <div className="p-4 text-red-500 bg-red-50 border border-red-200 rounded-md">Error loading rules: {rulesRes.error}</div>;
  if ( !catRes.success ) return <div className="p-4 text-red-500 bg-red-50 border border-red-200 rounded-md">Error loading categories: {catRes.error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fee Rules</h2>
          <p className="text-muted-foreground">
            Configure dynamic fee calculation rules for transactions.
          </p>
        </div>
        <FeeRuleFormDialog 
          categories={catRes.categories || []} 
          existingCategoryIds={rulesRes.rules?.map( ( r: any ) => r.categoryId ) || []}
        />
      </div>
      <FeeRulesTable rules={rulesRes.rules || []}
        categories={catRes.categories || []}
      />
    </div>
  );
}
