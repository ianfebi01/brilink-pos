"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { TransactionForm } from "./transaction-form";

interface TransactionFormDialogProps {
  categories: any[];
  feeRules: any[];
  recentTransactions?: any[];
  initialData?: any;
  trigger?: React.ReactElement;
}

export function TransactionFormDialog( { 
  categories, 
  feeRules, 
  recentTransactions,
  initialData,
  trigger
}: TransactionFormDialogProps ) {
  const [open, setOpen] = useState( false );
  const [formLoading, setFormLoading] = useState( false );
  const [formValid, setFormValid] = useState( false );
  const formId = `transaction-form-${initialData?.id || "new"}`;

  return (
    <Dialog open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger
        render={
          trigger || (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Transaksi Baru
            </Button>
          )
        }
      />
      <DialogContent className="w-full max-w-full h-[100dvh] max-h-[100dvh] sm:h-auto sm:max-h-[calc(100vh-4rem)] p-4 sm:p-6 rounded-none sm:rounded-xl overflow-y-auto sm:max-w-[600px] flex flex-col">
        <DialogHeader className="-mx-4 -mt-4 mb-4 px-4 py-4 sm:-mx-6 sm:-mt-6 sm:px-6 sm:py-6 border-b bg-muted/30 shrink-0">
          <DialogTitle>{initialData ? "Ubah Transaksi" : "Buat Transaksi"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Ubah rincian transaksi Anda." : "Masukkan rincian transaksi. Biaya fee akan dihitung secara otomatis berdasarkan aturan yang berlaku."}
          </DialogDescription>
        </DialogHeader>
        <div className="-mx-4 no-scrollbar overflow-y-auto px-4 grow flex flex-col">
          <TransactionForm 
            id={formId}
            initialData={initialData}
            categories={categories} 
            feeRules={feeRules} 
            recentTransactions={recentTransactions}
            onSuccess={() => setOpen( false )} 
            onLoadingChange={setFormLoading}
            onValidityChange={setFormValid}
          />
        </div>
        <DialogFooter className="-mx-4 -mb-4 mt-auto px-4 py-4 sm:-mx-6 sm:-mb-6 sm:px-6 sm:py-4 border-t bg-muted/30 shrink-0">
          <DialogClose render={<Button variant="outline">Batal</Button>} />
          <Button 
            form={formId} 
            type="submit" 
            disabled={formLoading || !formValid}
          >
            {formLoading ? "Menyimpan..." : ( initialData ? "Simpan Perubahan" : "Simpan Transaksi" )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
