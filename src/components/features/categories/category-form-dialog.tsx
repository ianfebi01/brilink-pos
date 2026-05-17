"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CategoryForm } from "./category-form";

export function CategoryFormDialog( {
  initialData,
  trigger,
}: {
  initialData?: any;
  trigger?: React.ReactNode;
} ) {
  const [open, setOpen] = useState( false );
  const [formLoading, setFormLoading] = useState( false );
  const isEditing = !!initialData?.id;
  const formId = "category-form";

  return (
    <Dialog open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger
        render={
          trigger || (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Kategori Baru
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Perbarui Kategori" : "Buat Kategori"}
          </DialogTitle>
          <DialogDescription>
            Masukkan nama kategori transaksi baru.
          </DialogDescription>
        </DialogHeader>
        <CategoryForm
          id={formId}
          initialData={initialData}
          onSuccess={() => setOpen( false )}
          onLoadingChange={setFormLoading}
        />
        <DialogFooter className="gap-2">
          <DialogClose render={<Button variant="outline">Batal</Button>} />
          <Button form={formId}
            type="submit"
            disabled={formLoading}
          >
            {formLoading ? "Menyimpan..." : isEditing ? "Perbarui Kategori" : "Simpan Kategori"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
