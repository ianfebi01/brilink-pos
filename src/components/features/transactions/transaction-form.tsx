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

const formSchema = z.object( {
  categoryId   : z.string().min( 1, "Category is required" ),
  feeRuleId    : z.string().optional(),
  amount       : z.number().min( 1, "Amount must be greater than 0" ),
  customerName : z.string().optional(),
  note         : z.string().optional(),
} );

type FormValues = z.infer<typeof formSchema>;

export function TransactionForm( {
  categories,
  feeRules,
  onSuccess,
}: {
  categories: any[];
  feeRules: any[];
  onSuccess: () => void;
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

  const watchAmount = form.watch( "amount" );
  const watchCategoryId = form.watch( "categoryId" );

  useEffect( () => {
    if ( watchAmount > 0 && watchCategoryId ) {
      const filteredRules = feeRules.filter( ( r ) => r.categoryId === watchCategoryId );
      
      const matchedRule = filteredRules.find( ( r ) => {
        const min = r.minAmount !== null ? Number( r.minAmount ) : 0;
        const max = r.maxAmount !== null ? Number( r.maxAmount ) : Infinity;
        
        return watchAmount >= min && watchAmount <= max;
      } );

      if ( matchedRule ) {
        form.setValue( "feeRuleId", matchedRule.id );
        if ( matchedRule.formulaJson ) {
          try {
            const formulaJson = typeof matchedRule.formulaJson === "string" 
              ? JSON.parse( matchedRule.formulaJson ) 
              : matchedRule.formulaJson;
            
            const result = calculateTransaction( watchAmount, formulaJson );
            setCalcResult( { ...result, appliedRule : matchedRule.name } );
          } catch ( e ) {
            console.error( "Formula error", e );
            setCalcResult( null );
          }
        } else {
          setCalcResult( null );
        }
      } else {
        form.setValue( "feeRuleId", "" );
        setCalcResult( { error : "No fee rule covers this amount." } );
      }
    } else {
      setCalcResult( null );
    }
  }, [watchAmount, watchCategoryId, feeRules] );

  const onSubmit = async ( values: FormValues ) => {
    if ( !calcResult || calcResult.error ) {
      toast.error( "Please ensure fee is calculated properly" );
      
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
      toast.success( "Transaction created" );
      form.reset();
      onSuccess();
    } else {
      toast.error( res.error || "Failed to create transaction" );
    }
  };

  const filteredRules = feeRules.filter( ( r ) => r.categoryId === watchCategoryId );

  return (
    <form onSubmit={form.handleSubmit( onSubmit )}
      className="space-y-6"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={watchCategoryId}
            onValueChange={( val ) => {
              form.setValue( "categoryId", String( val ) );
              form.setValue( "feeRuleId", "" ); // reset rule
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category">
                {watchCategoryId ? categories.find( ( c ) => c.id === watchCategoryId )?.name : "Select category"}
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
          <Label>Transaction Amount (Rp)</Label>
          <Input type="number"
            {...form.register( "amount", { valueAsNumber : true } )}
            placeholder="100000"
          />
          {form.formState.errors.amount && (
            <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>
          )}
        </div>
      </div>

      {calcResult && !calcResult.error && (
        <div className="rounded-md bg-muted p-4 space-y-2 text-sm border">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">Calculation Breakdown</h4>
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
              Rule: {calcResult.appliedRule}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount:</span>
            <span>Rp {calcResult.amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Customer Fee:</span>
            <span>Rp {calcResult.customer_fee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">BRI Fee (internal):</span>
            <span>Rp {calcResult.bri_fee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-medium text-green-600">
            <span>Agent Profit:</span>
            <span>Rp {calcResult.agent_profit.toLocaleString()}</span>
          </div>
          <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
            <span>Total to Pay:</span>
            <span>Rp {calcResult.total_paid.toLocaleString()}</span>
          </div>
        </div>
      )}

      {calcResult?.error && (
        <div className="rounded-md bg-red-50 text-red-500 p-3 text-sm border border-red-200">
          {calcResult.error}
        </div>
      )}

      <div className="space-y-2">
        <Label>Customer Name (Optional)</Label>
        <Input {...form.register( "customerName" )}
          placeholder="Budi"
        />
      </div>

      <div className="space-y-2">
        <Label>Note (Optional)</Label>
        <Input {...form.register( "note" )}
          placeholder="Transfer ke BCA"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline"
          type="button"
          onClick={onSuccess}
        >
          Cancel
        </Button>
        <Button type="submit"
          disabled={loading || !calcResult || calcResult.error}
        >
          {loading ? "Saving..." : "Save Transaction"}
        </Button>
      </div>
    </form>
  );
}
