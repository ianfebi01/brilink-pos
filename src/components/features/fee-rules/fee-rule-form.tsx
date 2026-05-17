"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createFeeRule, updateFeeRule } from "@/actions/fee-rules";
import { toast } from "sonner";
import { FormulaType } from "@/features/formulas/engine";
import { X, Trash2 } from "lucide-react";

const VARIABLES = [
  { key : "amount", label : "Transaction Amount" },
  { key : "customer_fee", label : "Customer Fee" },
  { key : "bri_fee", label : "BRI Fee" },
  { key : "agent_profit", label : "Agent Profit" },
  { key : "total_paid", label : "Total Paid" },
];

const OPERATORS = [
  { key : "+", label : "+" },
  { key : "-", label : "-" },
  { key : "*", label : "×" },
  { key : "/", label : "÷" },
];

function ExpressionBuilder( { value, onChange }: { value: string, onChange: ( v: string ) => void } ) {
  const tokens = value ? value.replace( /\s+/g, '' ).split( /([+\-*/()])/ ).filter( t => t.length > 0 ) : [];

  const addToken = ( token: string ) => {
    onChange( [...tokens, token].join( " " ) );
  };

  const removeToken = ( index: number ) => {
    const newTokens = [...tokens];
    newTokens.splice( index, 1 );
    onChange( newTokens.join( " " ) );
  };

  const [customNumber, setCustomNumber] = useState( "" );

  const handleAddNumber = () => {
    if ( customNumber && !isNaN( Number( customNumber ) ) ) {
      addToken( customNumber );
      setCustomNumber( "" );
    }
  }

  return (
    <div className="space-y-2 w-full">
      <div className="flex flex-wrap gap-1.5 p-2 border rounded-md min-h-[42px] items-center bg-background">
        {tokens.length === 0 && <span className="text-muted-foreground text-xs px-1">Expression is empty</span>}
        {tokens.map( ( token, i ) => {
          const varMatch = VARIABLES.find( v => v.key === token );
          const opMatch = OPERATORS.find( o => o.key === token );
          const isNum = !isNaN( Number( token ) );
          
          let display = token;
          let colorClass = "bg-secondary text-secondary-foreground";
          
          if ( varMatch ) {
            display = varMatch.label;
            colorClass = "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800";
          } else if ( opMatch ) {
            colorClass = "bg-muted text-muted-foreground border-transparent font-bold";
          } else if ( isNum ) {
            colorClass = "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800";
          }

          return (
            <div key={i}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs border ${colorClass}`}
            >
              {display}
              <button type="button"
                onClick={() => removeToken( i )}
                className="hover:opacity-70 ml-1"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          );
        } )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Select value=""
          onValueChange={( val ) => {
            addToken( val ); 
          }}
        >
          <SelectTrigger className="h-8 text-xs w-[140px] bg-background">
            <SelectValue placeholder="+ Variable">
              + Variable
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {VARIABLES.map( v => <SelectItem key={v.key}
              value={v.key}
            >{v.label}</SelectItem> )}
          </SelectContent>
        </Select>

        <div className="flex rounded-md border overflow-hidden bg-background">
          {OPERATORS.map( op => (
            <button 
              key={op.key} 
              type="button" 
              onClick={() => addToken( op.key )}
              className="h-8 px-3 text-xs hover:bg-accent border-r last:border-r-0 transition-colors font-medium"
            >
              {op.label}
            </button>
          ) )}
        </div>

        <div className="flex items-center gap-1 border rounded-md overflow-hidden bg-background">
          <Input 
            type="number" 
            value={customNumber} 
            onChange={( e ) => setCustomNumber( e.target.value )}
            placeholder="123" 
            className="h-8 w-[80px] border-0 focus-visible:ring-0 text-xs"
            onKeyDown={( e ) => {
              if ( e.key === 'Enter' ) {
                e.preventDefault(); handleAddNumber(); 
              } 
            }}
          />
          <Button type="button"
            variant="secondary"
            size="sm"
            className="h-8 px-2 text-xs rounded-none border-l"
            onClick={handleAddNumber}
          >
            Add Num
          </Button>
        </div>
      </div>
    </div>
  );
}

interface FormulaBuilderProps {
  label: string;
  fieldKey: string;
  value: any;
  onChange: ( key: string, val: any ) => void;
}

function FormulaFieldBuilder( { label, fieldKey, value, onChange }: FormulaBuilderProps ) {
  const type = value?.type || "fixed";
  const val = value?.value || 0;
  const expr = value?.expression || "";

  return (
    <div className="grid grid-cols-12 gap-2 items-end border p-3 rounded-md bg-muted/20">
      <div className="col-span-3">
        <Label className="text-xs mb-1 block">{label}</Label>
        <Select value={type}
          onValueChange={( t ) => onChange( fieldKey, { ...value, type : t } )}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue>
              {type === "percentage" ? "Percentage" : type === "formula" ? "Formula" : "Fixed"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fixed">Fixed</SelectItem>
            <SelectItem value="percentage">Percentage</SelectItem>
            <SelectItem value="formula">Formula</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-9">
        {type === "formula" ? (
          <div className="w-full">
            <Label className="text-xs mb-1 block text-muted-foreground">Expression Builder</Label>
            <ExpressionBuilder 
              value={expr} 
              onChange={( newExpr ) => onChange( fieldKey, { ...value, expression : newExpr } )} 
            />
          </div>
        ) : (
          <div>
            <Label className="text-xs mb-1 block text-muted-foreground">Value {type === 'percentage' ? '(%)' : '(Rp)'}</Label>
            <Input 
              type="number" 
              className="h-8 text-xs" 
              value={val} 
              onChange={( e ) => onChange( fieldKey, { ...value, value : Number( e.target.value ) } )} 
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function FeeRuleForm( { categories, onSuccess, initialData }: { categories: any[], onSuccess: () => void, initialData?: any } ) {
  const [loading, setLoading] = useState( false );
  const [categoryId, setCategoryId] = useState( initialData?.categoryId || "" );
  const [name, setName] = useState( initialData?.name || "" );
  const [minAmount, setMinAmount] = useState<number | "">( initialData?.minAmount ?? "" );
  const [maxAmount, setMaxAmount] = useState<number | "">( initialData?.maxAmount ?? "" );

  // Default formulas
  const defaultFormulas = {
    customer_fee : { type : "fixed", value : 10000 },
    bri_fee      : { type : "fixed", value : 5000 },
    agent_profit : { type : "formula", expression : "customer_fee - bri_fee" },
    total_paid   : { type : "formula", expression : "amount + customer_fee" }
  };

  const [formulas, setFormulas] = useState<Record<string, any>>(
    initialData?.formulaJson 
      ? ( typeof initialData.formulaJson === "string" ? JSON.parse( initialData.formulaJson ) : initialData.formulaJson )
      : defaultFormulas
  );

  const handleFormulaChange = ( key: string, val: any ) => {
    setFormulas( prev => ( { ...prev, [key] : val } ) );
  };

  const handleSubmit = async ( e: React.FormEvent ) => {
    e.preventDefault();
    if ( !categoryId || !name ) {
      toast.error( "Category and name are required" );
      
      return;
    }

    setLoading( true );
    const payload = {
      categoryId,
      name,
      minAmount   : minAmount === "" ? null : Number( minAmount ),
      maxAmount   : maxAmount === "" ? null : Number( maxAmount ),
      formulaJson : formulas
    };

    let res;
    if ( initialData?.id ) {
      res = await updateFeeRule( initialData.id, payload );
    } else {
      res = await createFeeRule( payload );
    }
    setLoading( false );

    if ( res.success ) {
      toast.success( initialData?.id ? "Rule updated" : "Rule created" );
      onSuccess();
    } else {
      toast.error( res.error || "Failed to save rule" );
    }
  };

  return (
    <form onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={categoryId}
            onValueChange={( val ) => setCategoryId( String( val ) )}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category">
                {categoryId ? categories.find( ( c ) => c.id === categoryId )?.name : "Select category"}
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
          <Label>Rule Name</Label>
          <Input value={name}
            onChange={( e ) => setName( e.target.value )}
            placeholder="Standard Transfer"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Min Amount (Optional)</Label>
          <Input type="number"
            value={minAmount}
            onChange={( e ) => setMinAmount( e.target.value as any )}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label>Max Amount (Optional)</Label>
          <Input type="number"
            value={maxAmount}
            onChange={( e ) => setMaxAmount( e.target.value as any )}
            placeholder="10000000"
          />
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t">
        <h4 className="font-semibold text-sm">Formula Configuration</h4>
        <p className="text-xs text-muted-foreground mb-4">
          Configure how fees are calculated. You can use variables: <code>amount</code>, <code>customer_fee</code>, <code>bri_fee</code>.
        </p>

        <FormulaFieldBuilder 
          label="Customer Fee"
          fieldKey="customer_fee" 
          value={formulas.customer_fee}
          onChange={handleFormulaChange} 
        />
        <FormulaFieldBuilder 
          label="BRI Fee"
          fieldKey="bri_fee" 
          value={formulas.bri_fee}
          onChange={handleFormulaChange} 
        />
        <FormulaFieldBuilder 
          label="Agent Profit"
          fieldKey="agent_profit" 
          value={formulas.agent_profit}
          onChange={handleFormulaChange} 
        />
        <FormulaFieldBuilder 
          label="Total Paid"
          fieldKey="total_paid" 
          value={formulas.total_paid}
          onChange={handleFormulaChange} 
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit"
          disabled={loading}
        >
          {loading ? "Saving..." : initialData?.id ? "Update Rule" : "Save Rule"}
        </Button>
      </div>
    </form>
  );
}
