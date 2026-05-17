"use client";

import { useRef, useLayoutEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import gsap from "gsap";

export default function NotFound() {
  const containerRef = useRef<HTMLDivElement>( null );
  const cardRef = useRef<HTMLDivElement>( null );
  const bannerRef = useRef<HTMLDivElement>( null );
  const textRef = useRef<HTMLDivElement>( null );

  useLayoutEffect( () => {
    const ctx = gsap.context( () => {
      // Set initial states
      gsap.set( [bannerRef.current, cardRef.current, ".animate-item", textRef.current], {
        opacity : 0,
      } );
      gsap.set( [".animate-item", textRef.current], {
        y : 20,
      } );

      // Entrance animations
      gsap.to( bannerRef.current, {
        duration : 1,
        opacity  : 1,
        ease     : "power2.out",
      } );

      gsap.to( cardRef.current, {
        duration : 1,
        opacity  : 1,
        ease     : "power2.out",
        delay    : 0.1,
      } );

      gsap.to( ".animate-item", {
        duration   : 0.6,
        y          : 0,
        opacity    : 1,
        stagger    : 0.08,
        ease       : "power2.out",
        delay      : 0.3,
        clearProps : "all",
      } );

      gsap.to( textRef.current, {
        duration   : 0.8,
        y          : 0,
        opacity    : 1,
        ease       : "power2.out",
        delay      : 0.5,
        clearProps : "all",
      } );
    }, containerRef );

    return () => ctx.revert();
  }, [] );

  return (
    <div ref={containerRef}
      className="relative flex min-h-screen w-full overflow-hidden bg-background"
    >
      {/* Left Column: Gradient Banner (Mirrors Login Page) */}
      <div 
        ref={bannerRef}
        className="relative hidden min-h-screen w-1/2 flex-col bg-linear-to-br from-primary via-primary/90 to-primary/70 lg:flex"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
        <div ref={textRef}
          className="relative z-10 mt-auto p-16 text-white"
        >
          <div className="space-y-4">
            <div className="h-1 w-20 bg-white/30 rounded-full" />
            <h1 className="text-5xl font-bold tracking-tight leading-tight">
              Akses Terputus <br /> 404 Terdeteksi
            </h1>
            <p className="max-w-md text-xl font-medium text-white/80 leading-relaxed">
              Halaman yang Anda tuju tidak dapat ditemukan dalam infrastruktur sistem kami.
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-40 left-10 h-40 w-40 rounded-full bg-black/5 blur-2xl" />
      </div>

      {/* Right Column: Error Message */}
      <div 
        ref={cardRef}
        className="flex w-full items-center justify-center overflow-y-auto p-6 lg:w-1/2"
      >
        <Card className="animate-item w-full max-md:max-w-[340px] md:max-w-md border-none shadow-none lg:border lg:shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="animate-item text-4xl font-bold tracking-tighter text-center text-primary mb-2">
              404
            </CardTitle>
            <CardTitle className="animate-item text-xl font-bold tracking-tight text-center">
              Halaman Tidak Ditemukan
            </CardTitle>
            <CardDescription className="animate-item text-center">
              Maaf, tautan yang Anda ikuti mungkin rusak atau halaman telah dihapus dari sistem administratif.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="animate-item">
              <Link href="/"
                passHref
              >
                <Button className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  Kembali ke Dashboard
                </Button>
              </Link>
            </div>
            <div className="animate-item text-center">
              <Link href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Atau masuk kembali ke sistem
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
