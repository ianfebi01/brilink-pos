"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash, Pencil } from "lucide-react";
import { deleteCategory } from "@/actions/categories";
import { CategoryFormDialog } from "./category-form-dialog";
import { toast } from "sonner";
import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function CategoryTable( { categories }: { categories: any[] } ) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = ( id: string ) => {
    if ( confirm( "Apakah Anda yakin ingin menghapus kategori ini?" ) ) {
      startTransition( async () => {
        const res = await deleteCategory( id );
        if ( res.success ) {
          toast.success( "Kategori berhasil dihapus" );
        } else {
          toast.error( res.error || "Gagal menghapus kategori" );
        }
      } );
    }
  };

  if ( !categories.length ) {
    return (
      <div className="rounded-md border p-8 text-center text-muted-foreground">
        Belum ada kategori.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent border-none">
            <TableHead>Nama Kategori</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Group Header Row like Transaction Table */}
          <TableRow className="bg-transparent hover:bg-muted/30 border-b">
            <TableCell className="py-2">
              <span className="font-semibold text-foreground/80">Semua Kategori</span>
            </TableCell>
            <TableCell className="text-right">
              <Badge variant="secondary"
                className="rounded-md font-normal bg-muted-foreground/10"
              >
                {categories.length} Kategori
              </Badge>
            </TableCell>
          </TableRow>

          {categories.map( ( category, index ) => (
            <TableRow key={category.id}
              className={cn( "hover:bg-primary/5 transition-colors", index % 2 === 0 ? "bg-white" : "bg-muted/30" )}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary/30 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{category.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                      Cat ID: {category.id.slice( -6 )}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <CategoryFormDialog
                    initialData={category}
                    trigger={
                      <Button variant="ghost"
                        size="icon"
                        className="text-amber-500 hover:text-amber-700 hover:bg-amber-50"
                        disabled={isPending}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete( category.id )}
                    disabled={isPending}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) )}
        </TableBody>
      </Table>
    </div>
  );
}
