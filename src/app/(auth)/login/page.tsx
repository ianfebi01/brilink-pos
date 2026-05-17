"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import gsap from "gsap";

const loginSchema = z.object( {
  username : z.string().nonempty( "Nama pengguna wajib diisi" ).min( 4, "Nama pengguna minimal 4 karakter" ),
  password : z.string().nonempty( "Kata sandi wajib diisi" ),
} );

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState( false );
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState : { errors },
  } = useForm<LoginValues>( {
    resolver : zodResolver( loginSchema ),
  } );

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance animations
      gsap.from(bannerRef.current, {
        duration: 1,
        opacity: 0,
        ease: "power2.out",
      });

      gsap.from(formRef.current, {
        duration: 1,
        opacity: 0,
        ease: "power2.out",
        delay: 0.1,
      });

      gsap.from(".animate-item", {
        duration: 0.6,
        y: 15,
        opacity: 0,
        stagger: 0.08,
        ease: "power2.out",
        delay: 0.3,
      });

      gsap.from(textRef.current, {
        duration: 0.8,
        y: 20,
        opacity: 0,
        ease: "power2.out",
        delay: 0.5,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const onSubmit = async ( values: LoginValues ) => {
    setLoading( true );
    try {
      const res = await signIn( "credentials", {
        username : values.username,
        password : values.password,
        redirect : false,
      } );

      if ( res?.error ) {
        toast.error( "Nama pengguna atau kata sandi salah" );
      } else {
        router.push( "/" );
        router.refresh();
      }
    } finally {
      setLoading( false );
    }
  };

  return (
    <div ref={containerRef} className="relative flex min-h-screen w-full overflow-hidden bg-background">
      {/* Left Column: Gradient Banner */}
      <div 
        ref={bannerRef}
        className="relative hidden min-h-screen w-1/2 flex-col bg-linear-to-br from-primary via-primary/90 to-primary/70 lg:flex"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
        <div ref={textRef} className="relative z-10 mt-auto p-16 text-white">
          <div className="space-y-4">
            <div className="h-1 w-20 bg-white/30 rounded-full" />
            <h1 className="text-5xl font-bold tracking-tight leading-tight">
              Sistem Manajemen <br /> Keuangan BRILink
            </h1>
            <p className="max-w-md text-xl font-medium text-white/80 leading-relaxed">
              Meningkatkan presisi administratif melalui pengawasan transaksi tingkat lanjut dan analitik operasional real-time.
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-40 left-10 h-40 w-40 rounded-full bg-black/5 blur-2xl" />
      </div>

      {/* Right Column: Login Form */}
      <div 
        ref={formRef}
        className="flex w-full items-center justify-center overflow-y-auto p-6 lg:w-1/2"
      >
        <Card className="animate-item w-full max-md:max-w-[340px] md:max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="animate-item text-2xl font-bold tracking-tight text-center">
              Autentikasi Portal
            </CardTitle>
            <CardDescription className="animate-item text-center">
              Silakan masukkan kredensial Anda untuk mengakses portal administratif.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit( onSubmit )}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="animate-item">Nama Pengguna</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Masukkan nama pengguna"
                  className="animate-item"
                  {...register( "username" )}
                />
                {errors.username && (
                  <p className="animate-item text-sm text-destructive">{errors.username.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="animate-item">Kata Sandi</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="animate-item"
                  {...register( "password" )}
                />
                {errors.password && (
                  <p className="animate-item text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
              <Button className="animate-item w-full"
                type="submit"
                disabled={loading}
              >
                {loading ? "Mengautentikasi..." : "Masuk ke Sistem"}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
