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
            Add Investment
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Daily Investment</DialogTitle>
          <DialogDescription>
            Record new capital added to the BRILink balance.
          </DialogDescription>
        </DialogHeader>
        <InvestmentForm onSuccess={() => setOpen( false )} />
      </DialogContent>
    </Dialog>
  );
}
