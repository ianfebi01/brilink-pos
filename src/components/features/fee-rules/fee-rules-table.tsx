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
    if ( confirm( "Apakah Anda yakin ingin menghapus aturan ini?" ) ) {
      startTransition( async () => {
        const res = await deleteFeeRule( id );
        if ( res.success ) {
          toast.success( "Aturan berhasil dihapus" );
        } else {
          toast.error( res.error || "Gagal menghapus aturan" );
        }
      } );
    }
  };



  if ( !rules.length ) {
    return (
      <div className="rounded-md border p-8 text-center text-muted-foreground">
        Belum ada aturan fee.
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent border-none">
            <TableHead>Nama</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Rentang Nominal</TableHead>
            <TableHead>Ringkasan Konfigurasi</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
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
                className={cn( "hover:bg-primary/5 transition-colors", index % 2 === 0 ? "bg-white" : "bg-muted/30" )}
              >
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="text-sm">{rule.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Rule ID: {rule.id.slice(-6)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {rule.category?.name}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1.5">
                    {tiers.slice(0, 3).map( ( t: any, i: number ) => (
                      <div key={i} className="flex items-center gap-2 group">
                        <span className="text-[9px] font-bold text-muted-foreground bg-muted px-1 rounded">T{i + 1}</span>
                        <span className="text-[11px] text-foreground font-medium">
                          {Number(t.minAmount).toLocaleString('id-ID')} - {t.maxAmount ? Number(t.maxAmount).toLocaleString('id-ID') : "∞"}
                        </span>
                      </div>
                    ) )}
                    {tierCount > 3 && (
                      <span className="text-[10px] italic text-muted-foreground pl-5">
                        +{tierCount - 3} tingkatan lainnya
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="max-w-md">
                  <div className="flex flex-col gap-3 py-1">
                    {tiers.slice( 0, 1 ).map( ( tier: any, i: number ) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries( tier.formulas || {} ).map( ( [k, v]: [string, any] ) => {
                            let display = "";
                            if ( v.type === "fixed" ) display = `Rp${Number(v.value).toLocaleString('id-ID')}`;
                            else if ( v.type === "percentage" ) display = `${v.value}%`;
                            else if ( v.type === "formula" ) display = "ƒ(x)";

                            const colors: Record<string, string> = {
                              customer_fee : "bg-blue-100 text-blue-700 border-blue-200",
                              bri_fee      : "bg-orange-100 text-orange-700 border-orange-200",
                              agent_profit : "bg-emerald-100 text-emerald-700 border-emerald-200",
                              total_paid   : "bg-indigo-100 text-indigo-700 border-indigo-200",
                            };

                            const labels: Record<string, string> = {
                              customer_fee : "Fee Pelanggan",
                              bri_fee      : "Fee BRI",
                              agent_profit : "Laba Agen",
                              total_paid   : "Total Bayar",
                            };

                            return (
                              <div key={k}
                                className={cn(
                                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors",
                                  colors[k] || "bg-muted text-muted-foreground border-transparent"
                                )}
                              >
                                <span className="opacity-70 mr-1">{labels[k] || k}:</span>
                                {display}
                              </div>
                            );
                          } )}
                        </div>
                      </div>
                    ) )}
                    {tierCount > 1 && (
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground italic border-t pt-1 border-dashed">
                        <span>Konfigurasi bervariasi di tiap tingkatan nominal</span>
                      </div>
                    )}
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
                          title="Edit Aturan"
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
                        name       : `${rule.name} (Salin)`,
                        categoryId : "", 
                      }}
                      trigger={
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          disabled={isPending}
                          title="Duplikat Aturan"
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
