import { getCategories, getFeeRules } from "@/actions/fee-rules";
import { FeeRulesTable } from "@/components/features/fee-rules/fee-rules-table";
import { FeeRuleFormDialog } from "@/components/features/fee-rules/fee-rule-form-dialog";

export default async function FeeRulesPage() {
  const [rulesRes, catRes] = await Promise.all( [
    getFeeRules(),
    getCategories()
  ] );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fee Rules</h2>
          <p className="text-muted-foreground">
            Configure dynamic fee calculation rules for transactions.
          </p>
        </div>
        <FeeRuleFormDialog categories={catRes.categories || []} />
      </div>
      <FeeRulesTable rules={rulesRes.rules || []}
        categories={catRes.categories || []}
      />
    </div>
  );
}
