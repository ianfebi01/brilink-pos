"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createInvestment } from "@/actions/investments";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export function InvestmentForm( { onSuccess }: { onSuccess: () => void } ) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState( false );
  const [amount, setAmount] = useState<string>( "" );
  const [note, setNote] = useState( "" );
  const [date, setDate] = useState( new Date().toISOString().split( "T" )[0] );

  const handleSubmit = async ( e: React.FormEvent ) => {
    e.preventDefault();
    if ( !amount || Number( amount ) <= 0 ) {
      toast.error( "Valid amount is required" );
      
      return;
    }

    setLoading( true );
    const res = await createInvestment( {
      amount         : Number( amount ),
      note,
      investmentDate : new Date( date ),
      createdById    : ( session?.user as any )?.id,
    } );
    setLoading( false );

    if ( res.success ) {
      toast.success( "Investment recorded" );
      onSuccess();
    } else {
      toast.error( res.error || "Failed to record investment" );
    }
  };

  return (
    <form onSubmit={handleSubmit}
      className="space-y-4 pt-4"
    >
      <div className="space-y-2">
        <Label>Tanggal</Label>
        <Input 
          type="date" 
          value={date} 
          onChange={( e ) => setDate( e.target.value )} 
          required 
        />
      </div>
      <div className="space-y-2">
        <Label>Nominal Investasi (Rp)</Label>
        <Input 
          type="number" 
          value={amount} 
          onChange={( e ) => setAmount( e.target.value )} 
          placeholder="Contoh: 1000000" 
          required 
        />
      </div>
      <div className="space-y-2">
        <Label>Catatan (Opsional)</Label>
        <Input 
          value={note} 
          onChange={( e ) => setNote( e.target.value )} 
          placeholder="Contoh: Top up saldo pagi" 
        />
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
