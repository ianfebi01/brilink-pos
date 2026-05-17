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
} from "@/components/ui/dialog";
import { TransactionForm } from "./transaction-form";

interface TransactionFormDialogProps {
  categories: any[];
  feeRules: any[];
}

export function TransactionFormDialog( { categories, feeRules }: TransactionFormDialogProps ) {
  const [open, setOpen] = useState( false );

  return (
    <Dialog open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger
        render={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Transaction
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Transaction</DialogTitle>
          <DialogDescription>
            Enter transaction details. Fees will be calculated automatically based on the selected fee rule.
          </DialogDescription>
        </DialogHeader>
        <TransactionForm 
          categories={categories} 
          feeRules={feeRules} 
          onSuccess={() => setOpen( false )} 
        />
      </DialogContent>
    </Dialog>
  );
}
