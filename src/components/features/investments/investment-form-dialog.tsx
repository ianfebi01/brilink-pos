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
import { InvestmentForm } from "./investment-form";

export function InvestmentFormDialog() {
  const [open, setOpen] = useState( false );

  return (
    <Dialog open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger
        render={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Investasi
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tambah Investasi Harian</DialogTitle>
          <DialogDescription>
            Catat penambahan modal baru ke saldo BRILink Anda.
          </DialogDescription>
        </DialogHeader>
        <InvestmentForm onSuccess={() => setOpen( false )} />
      </DialogContent>
    </Dialog>
  );
}
