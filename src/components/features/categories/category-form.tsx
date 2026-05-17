"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createCategory, updateCategory } from "@/actions/categories";

const formSchema = z.object( {
  name : z.string().min( 2, "Nama kategori minimal 2 karakter" ).max( 50, "Nama kategori terlalu panjang" ),
} );

type FormValues = z.infer<typeof formSchema>;

export function CategoryForm( {
  initialData,
  onSuccess,
  id,
  onLoadingChange,
  onValidityChange
}: {
  initialData?: any;
  onSuccess: () => void;
  id?: string;
  onLoadingChange?: ( loading: boolean ) => void;
  onValidityChange?: ( isValid: boolean ) => void;
} ) {
  const [loading, setLoading] = useState( false );

  const form = useForm<FormValues>( {
    resolver      : zodResolver( formSchema ),
    mode          : "onBlur",
    defaultValues : {
      name : initialData?.name || "",
    },
  } );

  useEffect( () => {
    onLoadingChange?.( loading );
  }, [loading, onLoadingChange] );

  const formIsValid = form.formState.isValid;
  useEffect( () => {
    onValidityChange?.( formIsValid );
  }, [formIsValid, onValidityChange] );

  const onSubmit = async ( values: FormValues ) => {
    setLoading( true );
    let res;
    if ( initialData?.id ) {
      res = await updateCategory( initialData.id, values );
    } else {
      res = await createCategory( values );
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
      onSubmit={form.handleSubmit( onSubmit )}
      className="space-y-4 grow"
    >
      <div className="space-y-2">
        <Label htmlFor="category-name">Nama Kategori</Label>
        <Input
          id="category-name"
          {...form.register( "name" )}
          placeholder="Contoh: Transfer Sesama BRI"
          autoFocus
        />
        {form.formState.errors.name && (
          <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
        )}
      </div>
    </form>
  );
}
