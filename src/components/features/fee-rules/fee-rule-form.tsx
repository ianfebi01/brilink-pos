"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createFeeRule, updateFeeRule } from "@/actions/fee-rules";
import { toast } from "sonner";
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

const formulaSchema = z.object( {
  type       : z.enum( ["fixed", "percentage", "formula"] ),
  value      : z.number().optional(),
  expression : z.string().optional(),
} );

const tierSchema = z.object( {
  minAmount : z.number().min( 0 ),
  maxAmount : z.number().min( 1 ),
  formulas  : z.object( {
    customer_fee : formulaSchema,
    bri_fee      : formulaSchema,
    agent_profit : formulaSchema,
    total_paid   : formulaSchema,
  } ),
} );

const formSchema = z.object( {
  categoryId : z.string().min( 1, "Kategori wajib diisi" ),
  name       : z.string().min( 2, "Nama minimal 2 karakter" ),
  tiers      : z.array( tierSchema ).min( 1, "Minimal satu tingkatan (tier) harus ada" ),
} ).superRefine( ( data, ctx ) => {
  data.tiers.forEach( ( tier, index ) => {
    // 1. Check if max > min for individual tier
    if ( tier.maxAmount <= tier.minAmount ) {
      ctx.addIssue( {
        code    : z.ZodIssueCode.custom,
        message : `Nominal maksimal harus lebih besar dari minimal (Tier ${index + 1})`,
        path    : ["tiers", index, "maxAmount"],
      } );
    }

    // 2. Check for overlaps with previous tier
    if ( index > 0 ) {
      const prevTier = data.tiers[index - 1];
      if ( tier.minAmount <= prevTier.maxAmount ) {
        ctx.addIssue( {
          code    : z.ZodIssueCode.custom,
          message : `Nominal minimal harus lebih besar dari maksimal Tier ${index} agar tidak tumpang tindih`,
          path    : ["tiers", index, "minAmount"],
        } );
      }
    }
  } );
} );

type FormValues = z.infer<typeof formSchema>;

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

function FormulaFieldBuilder( { label, value, onChange }: { label: string, value: any, onChange: ( val: any ) => void } ) {
  const type = value?.type || "fixed";
  const val = value?.value || 0;
  const expr = value?.expression || "";

  return (
    <div className="grid grid-cols-12 gap-2 items-end border p-3 rounded-md bg-muted/20">
      <div className="col-span-3">
        <Label className="text-xs mb-1 block">{label}</Label>
        <Select value={type}
          onValueChange={( t ) => onChange( { ...value, type : t } )}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue>
              {type === "percentage" ? "Persentase" : type === "formula" ? "Rumus" : "Tetap"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fixed">Tetap</SelectItem>
            <SelectItem value="percentage">Persentase</SelectItem>
            <SelectItem value="formula">Rumus</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-9">
        {type === "formula" ? (
          <div className="w-full">
            <Label className="text-xs mb-1 block text-muted-foreground">Pembuat Ekspresi</Label>
            <ExpressionBuilder 
              value={expr} 
              onChange={( newExpr ) => onChange( { ...value, expression : newExpr } )} 
            />
          </div>
        ) : (
          <div>
            <Label className="text-xs mb-1 block text-muted-foreground">Value {type === 'percentage' ? '(%)' : '(Rp)'}</Label>
            <Input 
              type="number" 
              className="h-8 text-xs" 
              value={val} 
              onChange={( e ) => onChange( { ...value, value : Number( e.target.value ) } )} 
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function FeeRuleForm( { 
  categories, 
  onSuccess, 
  initialData,
  existingCategoryIds = [],
  id,
  onLoadingChange
}: { 
  categories: any[], 
  onSuccess: () => void, 
  initialData?: any,
  existingCategoryIds?: string[],
  id?: string,
  onLoadingChange?: ( loading: boolean ) => void
} ) {
  const [loading, setLoading] = useState( false );

  const defaultFormulas = {
    customer_fee : { type : "fixed", value : 10000 },
    bri_fee      : { type : "fixed", value : 5000 },
    agent_profit : { type : "formula", expression : "customer_fee - bri_fee" },
    total_paid   : { type : "formula", expression : "amount + customer_fee" }
  };

  const form = useForm<FormValues>( {
    resolver      : zodResolver( formSchema ),
    mode          : "onBlur",
    defaultValues : {
      categoryId : initialData?.categoryId || "",
      name       : initialData?.name || "",
      tiers      : initialData?.formulaJson 
        ? ( typeof initialData.formulaJson === "string" ? JSON.parse( initialData.formulaJson ) : initialData.formulaJson )
        : [{ minAmount : 0, maxAmount : 1000000, formulas : defaultFormulas }]
    }
  } );

  const { fields, append, remove } = useFieldArray( {
    control : form.control,
    name    : "tiers"
  } );

  useEffect( () => {
    onLoadingChange?.( loading );
  }, [loading, onLoadingChange] );

  const onSubmit = async ( values: FormValues ) => {
    setLoading( true );
    let res;
    if ( initialData?.id ) {
      res = await updateFeeRule( initialData.id, {
        categoryId  : values.categoryId,
        name        : values.name,
        formulaJson : values.tiers
      } );
    } else {
      res = await createFeeRule( {
        categoryId  : values.categoryId,
        name        : values.name,
        formulaJson : values.tiers
      } );
    }
    setLoading( false );

    if ( res.success ) {
      toast.success( initialData?.id ? "Aturan berhasil diperbarui" : "Aturan berhasil dibuat" );
      onSuccess();
    } else {
      toast.error( res.error || "Gagal menyimpan aturan" );
    }
  };

  const watchCategoryId = form.watch( "categoryId" );

  const availableCategories = categories.filter( ( c ) => {
    if ( !!initialData?.id && c.id === initialData.categoryId ) return true;
    
    return !existingCategoryIds.includes( c.id );
  } );

  return (
    <form id={id}
      onSubmit={form.handleSubmit( onSubmit )}
      className="space-y-6"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={watchCategoryId}
            onValueChange={( val ) => form.setValue( "categoryId", String( val ) )}
            disabled={!!initialData?.id}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih kategori">
                {watchCategoryId ? categories.find( ( c ) => c.id === watchCategoryId )?.name : "Pilih kategori"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableCategories.map( ( c ) => (
                <SelectItem key={c.id}
                  value={c.id}
                >{c.name}</SelectItem>
              ) )}
            </SelectContent>
          </Select>
          {form.formState.errors.categoryId && (
            <p className="text-sm text-red-500">{form.formState.errors.categoryId.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Nama Aturan Fee</Label>
          <Input 
            {...form.register( "name" )}
            placeholder="Contoh: Transfer Standar"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold text-sm">Konfigurasi Tingkatan (Tier)</h4>
          <Button type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const lastTier = fields[fields.length - 1] as any;
              const newMin = lastTier ? Number( lastTier.maxAmount ) + 1 : 0;
              append( { 
                minAmount : newMin, 
                maxAmount : newMin + 1000000, 
                formulas  : { ...defaultFormulas } 
              } );
            }}
          >
            Tambah Rentang Nominal
          </Button>
        </div>
        
        <div className="space-y-8">
          {fields.map( ( field, index ) => (
            <div key={field.id}
              className="space-y-4 p-4 border rounded-lg bg-muted/5 relative"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tier {index + 1}</span>
                {fields.length > 1 && (
                  <Button type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-500 h-6 px-2"
                    onClick={() => remove( index )}
                  >
                    <X className="h-4 w-4 mr-1" /> Hapus
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Nominal Minimal</Label>
                  <Input type="number"
                    {...form.register( `tiers.${index}.minAmount`, { valueAsNumber : true } )}
                    placeholder="0"
                  />
                  {form.formState.errors.tiers?.[index]?.minAmount && (
                    <p className="text-[10px] text-red-500">{form.formState.errors.tiers[index].minAmount?.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Nominal Maksimal</Label>
                  <Input type="number"
                    {...form.register( `tiers.${index}.maxAmount`, { valueAsNumber : true } )}
                    placeholder="1000000"
                  />
                  {form.formState.errors.tiers?.[index]?.maxAmount && (
                    <p className="text-[10px] text-red-500">{form.formState.errors.tiers[index].maxAmount?.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {["customer_fee", "bri_fee", "agent_profit", "total_paid"].map( ( fKey ) => (
                  <FormulaFieldBuilder 
                    key={fKey}
                    label={fKey.replace( "_", " " ).replace( /\b\w/g, l => l.toUpperCase() )}
                    value={( field as any ).formulas[fKey]}
                    onChange={( newVal ) => {
                      form.setValue( `tiers.${index}.formulas.${fKey}` as any, newVal );
                    }} 
                  />
                ) )}
              </div>
            </div>
          ) )}
        </div>
        {form.formState.errors.tiers && (
          <p className="text-sm text-red-500">{form.formState.errors.tiers.message}</p>
        )}
      </div>
    </form>
  );
}
