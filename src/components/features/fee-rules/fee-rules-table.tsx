"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash, Copy, Pencil } from "lucide-react";
import { deleteFeeRule } from "@/actions/fee-rules";
import { FeeRuleFormDialog } from "./fee-rule-form-dialog";
import { toast } from "sonner";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

export function FeeRulesTable( { rules, categories }: { rules: any[]; categories: any[] } ) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = ( id: string ) => {
    if ( confirm( "Are you sure you want to delete this rule?" ) ) {
      startTransition( async () => {
        const res = await deleteFeeRule( id );
        if ( res.success ) {
          toast.success( "Rule deleted" );
        } else {
          toast.error( res.error || "Failed to delete rule" );
        }
      } );
    }
  };



  if ( !rules.length ) {
    return (
      <div className="rounded-md border p-8 text-center text-muted-foreground">
        No fee rules found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent border-none">
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Amount Range</TableHead>
            <TableHead>Configuration Summary</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules.map( ( rule, index ) => {
            const parsedFormula = typeof rule.formulaJson === "string" 
              ? JSON.parse( rule.formulaJson ) 
              : rule.formulaJson;
            const tiers = Array.isArray( parsedFormula ) ? parsedFormula : [];
            const tierCount = tiers.length;

            return (
              <TableRow key={rule.id}
                className={cn( "hover:bg-primary/10 transition-colors", index % 2 === 0 ? "bg-white" : "bg-muted/50" )}
              >
                <TableCell className="font-medium">{rule.name}</TableCell>
                <TableCell>{rule.category?.name}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {tiers.map( ( t: any, i: number ) => (
                      <span key={i}
                        className="text-[10px] text-muted-foreground whitespace-nowrap"
                      >
                        T{i + 1}: {t.minAmount.toLocaleString()} - {t.maxAmount.toLocaleString()}
                      </span>
                    ) )}
                  </div>
                </TableCell>
                <TableCell className="max-w-md">
                  <div className="flex flex-col gap-2">
                    {tiers.slice( 0, 2 ).map( ( tier: any, i: number ) => (
                      <div key={i}
                        className="flex flex-wrap gap-1 border-l-2 border-primary/20 pl-2"
                      >
                        {Object.entries( tier.formulas || {} ).map( ( [k, v]: [string, any] ) => {
                          let display = "";
                          if ( v.type === "fixed" ) display = `Rp${v.value}`;
                          else if ( v.type === "percentage" ) display = `${v.value}%`;
                          else if ( v.type === "formula" ) display = v.expression;
                          
                          return (
                            <span key={k}
                              className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[9px] font-medium text-muted-foreground capitalize"
                            >
                              {k.replace( /_/g, ' ' )}: {display}
                            </span>
                          );
                        } )}
                      </div>
                    ) )}
                    {tierCount > 2 && <span className="text-[10px] italic text-muted-foreground">...and {tierCount - 2} more tiers</span>}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <FeeRuleFormDialog 
                      categories={categories}
                      existingCategoryIds={rules.map( r => r.categoryId )}
                      initialData={rule}
                      trigger={
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-amber-500 hover:text-amber-700 hover:bg-amber-50"
                          disabled={isPending}
                          title="Edit Rule"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <FeeRuleFormDialog 
                      categories={categories}
                      existingCategoryIds={rules.map( r => r.categoryId )}
                      initialData={{
                        ...rule,
                        id         : undefined,
                        name       : `${rule.name} (Copy)`,
                        categoryId : "", 
                      }}
                      trigger={
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          disabled={isPending}
                          title="Duplicate Rule"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete( rule.id )}
                      disabled={isPending}
                      title="Delete Rule"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          } )}
        </TableBody>
      </Table>
    </div>
  );
}
