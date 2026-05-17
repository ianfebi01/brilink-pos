"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createCategory, updateCategory } from "@/actions/categories";

export function CategoryForm( {
  initialData,
  onSuccess,
  id,
  onLoadingChange
}: {
  initialData?: any;
  onSuccess: () => void;
  id?: string;
  onLoadingChange?: ( loading: boolean ) => void;
} ) {
  const [loading, setLoading] = useState( false );
  const [name, setName] = useState( initialData?.name || "" );

  useEffect( () => {
    onLoadingChange?.( loading );
  }, [loading, onLoadingChange] );

  const handleSubmit = async ( e: React.FormEvent ) => {
    e.preventDefault();
    if ( !name.trim() ) {
      toast.error( "Nama kategori wajib diisi" );
      
      return;
    }

    setLoading( true );
    let res;
    if ( initialData?.id ) {
      res = await updateCategory( initialData.id, { name } );
    } else {
      res = await createCategory( { name } );
    }
    setLoading( false );

    if ( res.success ) {
      toast.success( initialData?.id ? "Kategori diperbarui" : "Kategori dibuat" );
      onSuccess();
    } else {
      toast.error( res.error || "Gagal menyimpan kategori" );
    }
  };

  return (
    <form id={id}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="category-name">Nama Kategori</Label>
        <Input
          id="category-name"
          value={name}
          onChange={( e ) => setName( e.target.value )}
          placeholder="Contoh: Transfer Sesama BRI"
          autoFocus
        />
      </div>
    </form>
  );
}
