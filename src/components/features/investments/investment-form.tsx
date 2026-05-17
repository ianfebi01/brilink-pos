"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createInvestment } from "@/actions/investments";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

const formSchema = z.object( {
  date   : z.string().min( 1, "Tanggal wajib diisi" ),
  amount : z.number().min( 1000, "Minimal investasi Rp 1.000" ),
  note   : z.string().optional(),
} );

type FormValues = z.infer<typeof formSchema>;

export function InvestmentForm( { onSuccess }: { onSuccess: () => void } ) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState( false );

  const form = useForm<FormValues>( {
    resolver      : zodResolver( formSchema ),
    mode          : "onBlur",
    defaultValues : {
      date   : new Date().toISOString().split( "T" )[0],
      amount : 0,
      note   : "",
    },
  } );

  const onSubmit = async ( values: FormValues ) => {
    setLoading( true );
    const res = await createInvestment( {
      amount         : values.amount,
      note           : values.note,
      investmentDate : new Date( values.date ),
      createdById    : ( session?.user as any )?.id,
    } );
    setLoading( false );

    if ( res.success ) {
      toast.success( "Investasi berhasil dicatat" );
      onSuccess();
    } else {
      toast.error( res.error || "Gagal mencatat investasi" );
    }
  };

  return (
    <form onSubmit={form.handleSubmit( onSubmit )}
      className="space-y-4 pt-4"
    >
      <div className="space-y-2">
        <Label>Tanggal</Label>
        <Input 
          type="date" 
          {...form.register( "date" )}
        />
        {form.formState.errors.date && (
          <p className="text-sm text-red-500">{form.formState.errors.date.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Nominal Investasi (Rp)</Label>
        <Input 
          type="number" 
          {...form.register( "amount", { valueAsNumber : true } )}
          placeholder="Contoh: 1000000" 
        />
        {form.formState.errors.amount && (
          <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Catatan (Opsional)</Label>
        <Input 
          {...form.register( "note" )}
          placeholder="Contoh: Top up saldo pagi" 
        />
        {form.formState.errors.note && (
          <p className="text-sm text-red-500">{form.formState.errors.note.message}</p>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit"
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan Investasi"}
        </Button>
      </div>
    </form>
  );
}
