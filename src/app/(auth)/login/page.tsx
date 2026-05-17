"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const loginSchema = z.object( {
  username : z.string().nonempty( "Username wajib diisi" ).min( 4, "Username minimal 4 karakter" ),
  password : z.string().nonempty( "Password wajib diisi" ),
} );

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState( false );

  const {
    register,
    handleSubmit,
    formState : { errors },
  } = useForm<LoginValues>( {
    resolver : zodResolver( loginSchema ),
    mode     : "onBlur",
  } );

  const onSubmit = async ( values: LoginValues ) => {
    setLoading( true );
    try {
      const res = await signIn( "credentials", {
        username : values.username,
        password : values.password,
        redirect : false,
      } );

      if ( res?.error ) {
        toast.error( "Username atau password salah" );
      } else {
        router.push( "/" );
        router.refresh();
      }
    } finally {
      setLoading( false );
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">
            Sistem Admin BRILink
          </CardTitle>
          <CardDescription className="text-center">
            Masukkan kredensial Anda untuk masuk ke akun
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit( onSubmit )}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                {...register( "username" )}
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register( "password" )}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
            <Button className="w-full"
              type="submit"
              disabled={loading}
            >
              {loading ? "Memuat..." : "Masuk"}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
