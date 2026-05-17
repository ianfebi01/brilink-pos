"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculateTransaction } from "@/features/formulas/engine";
import { createTransaction } from "@/actions/transactions";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { LayoutDashboard, Zap } from "lucide-react";

function formatIDR( amount: number ) {
  return new Intl.NumberFormat( "id-ID", {
    style                 : "currency",
    currency              : "IDR",
    minimumFractionDigits : 0,
  } ).format( amount );
}

const formSchema = z.object( {
  categoryId   : z.string().min( 1, "Kategori wajib diisi" ),
  feeRuleId    : z.string().optional(),
  amount       : z.number().min( 1, "Nominal harus lebih besar dari 0" ),
  customerName : z.string().optional(),
  note         : z.string().optional(),
} );

type FormValues = z.infer<typeof formSchema>;

export function TransactionForm( {
  categories,
  feeRules,
  onSuccess,
  recentTransactions = [],
}: {
  categories: any[];
  feeRules: any[];
  onSuccess: () => void;
  recentTransactions?: any[];
} ) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState( false );
  const [calcResult, setCalcResult] = useState<any>( null );

  const form = useForm<FormValues>( {
    resolver      : zodResolver( formSchema ),
    defaultValues : {
      categoryId   : "",
      feeRuleId    : "",
      amount       : 0,
      customerName : "",
      note         : "",
    },
  } );

  const applySuggestion = ( tx: any ) => {
    form.setValue( "categoryId", tx.categoryId );
    form.setValue( "amount", Number( tx.transactionAmount ) );
    form.setValue( "note", tx.note || "" );
    toast.success( `Diterapkan: ${tx.category?.name} - ${formatIDR( Number( tx.transactionAmount ) )}` );
  };

  const watchAmount = form.watch( "amount" );
  const watchCategoryId = form.watch( "categoryId" );

  useEffect( () => {
    if ( watchAmount > 0 && watchCategoryId ) {
      const categoryRule = feeRules.find( ( r ) => r.categoryId === watchCategoryId );
      
      if ( categoryRule ) {
        const tiers = typeof categoryRule.formulaJson === "string" 
          ? JSON.parse( categoryRule.formulaJson ) 
          : categoryRule.formulaJson;
          
        const matchedTier = tiers.find( ( t: any ) => {
          const min = t.minAmount !== null ? Number( t.minAmount ) : 0;
          const max = t.maxAmount !== null ? Number( t.maxAmount ) : Infinity;
          
          return watchAmount >= min && watchAmount <= max;
        } );

        if ( matchedTier ) {
          form.setValue( "feeRuleId", categoryRule.id );
          try {
            const result = calculateTransaction( watchAmount, matchedTier.formulas );
            setCalcResult( { ...result, appliedRule : `${categoryRule.name} (Tier: ${matchedTier.minAmount}-${matchedTier.maxAmount})` } );
          } catch ( e ) {
            // eslint-disable-next-line no-console
            console.error( "Formula error", e );
            setCalcResult( null );
          }
        } else {
          form.setValue( "feeRuleId", "" );
          setCalcResult( { error : "No amount tier matches this transaction amount." } );
        }
      } else {
        form.setValue( "feeRuleId", "" );
        setCalcResult( { error : "No fee rule defined for this category." } );
      }
    } else {
      setCalcResult( null );
    }
  }, [watchAmount, watchCategoryId, feeRules] );

  const onSubmit = async ( values: FormValues ) => {
    if ( !calcResult || calcResult.error ) {
      toast.error( "Pastikan biaya fee telah dihitung dengan benar" );
      
      return;
    }

    setLoading( true );
    const res = await createTransaction( {
      categoryId        : values.categoryId,
      feeRuleId         : values.feeRuleId || undefined,
      transactionAmount : values.amount,
      customerFee       : calcResult.customer_fee,
      briFee            : calcResult.bri_fee,
      agentProfit       : calcResult.agent_profit,
      totalPaid         : calcResult.total_paid,
      customerName      : values.customerName,
      note              : values.note,
      createdById       : ( session?.user as any )?.id,
    } );

    setLoading( false );
    if ( res.success ) {
      toast.success( "Transaksi berhasil dibuat" );
      form.reset();
      onSuccess();
    } else {
      toast.error( res.error || "Gagal membuat transaksi" );
    }
  };

  return (
    <form onSubmit={form.handleSubmit( onSubmit )}
      className="space-y-6"
    >
      {recentTransactions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
            Sugesti Terkini
          </div>
          <div className="relative">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 w-full">
              {recentTransactions.map( ( tx, i ) => (
                <button
                  key={tx.id || i}
                  type="button"
                  onClick={() => applySuggestion( tx )}
                  className="flex flex-col items-start gap-1 p-2 rounded-lg border bg-muted/30 hover:bg-primary/10 hover:border-primary/30 transition-all min-w-[140px] shrink-0 text-left group"
                >
                  <span className="text-[10px] font-bold text-primary truncate w-full">{tx.category?.name}</span>
                  <span className="text-xs font-bold">{formatIDR( Number( tx.transactionAmount ) )}</span>
                  <span className="text-[9px] text-muted-foreground group-hover:text-primary/70">Klik untuk salin</span>
                </button>
              ) )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Kategori</Label>
          <Select value={watchCategoryId}
            onValueChange={( val ) => {
              form.setValue( "categoryId", String( val ) );
              form.setValue( "feeRuleId", "" ); // reset rule
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih kategori">
                {watchCategoryId ? categories.find( ( c ) => c.id === watchCategoryId )?.name : "Pilih kategori"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {categories.map( ( c ) => (
                <SelectItem key={c.id}
                  value={c.id}
                >{c.name}</SelectItem>
              ) )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Nominal Transaksi (Rp)</Label>
          <Input type="number"
            {...form.register( "amount", { valueAsNumber : true } )}
            placeholder="Contoh: 100000"
          />
          {form.formState.errors.amount && (
            <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>
          )}
        </div>
      </div>

      {calcResult && !calcResult.error && (
        <div className="bg-muted/30 p-4 rounded-lg border border-primary/10 space-y-3">
          {( session?.user as any )?.role === "superadmin" ? (
            <>
              <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Rincian Perhitungan
              </h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Nominal:</span>
                  <span className="font-medium text-foreground">{formatIDR( watchAmount )}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Fee Pelanggan:</span>
                  <span className="font-medium text-blue-600">+{formatIDR( calcResult.customer_fee )}</span>
                </div>
                <div className="flex justify-between text-muted-foreground border-t pt-1.5 mt-1.5">
                  <span>Fee BRI (internal):</span>
                  <span className="font-medium text-red-600">-{formatIDR( calcResult.bri_fee )}</span>
                </div>
                <div className="flex justify-between text-primary font-bold text-base border-t border-primary/20 pt-1.5 mt-1.5">
                  <span>Laba Agen:</span>
                  <span>{formatIDR( calcResult.agent_profit )}</span>
                </div>
                <div className="flex justify-between text-muted-foreground text-xs pt-1 mt-2 border-t border-dashed">
                  <span>Total yang Harus Dibayar:</span>
                  <span className="font-semibold">{formatIDR( calcResult.total_paid )}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex justify-between items-center py-1">
              <span className="text-sm font-semibold text-muted-foreground">Total yang Harus Dibayar:</span>
              <span className="text-xl font-bold text-primary">{formatIDR( calcResult.total_paid )}</span>
            </div>
          )}
        </div>
      )}

      {calcResult?.error && (
        <div className="rounded-md bg-red-50 text-red-500 p-3 text-sm border border-red-200">
          {calcResult.error}
        </div>
      )}

      <div className="space-y-2">
        <Label>Nama Pelanggan (Opsional)</Label>
        <Input {...form.register( "customerName" )}
          placeholder="Contoh: Budi"
        />
      </div>

      <div className="space-y-2">
        <Label>Catatan (Opsional)</Label>
        <Input {...form.register( "note" )}
          placeholder="Contoh: Transfer ke BCA"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline"
          type="button"
          onClick={onSuccess}
        >
          Batal
        </Button>
        <Button type="submit"
          disabled={loading || !calcResult || calcResult.error}
        >
          {loading ? "Menyimpan..." : "Simpan Transaksi"}
        </Button>
      </div>
    </form>
  );
}
