"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

interface TransitionWrapperProps {
  children: React.ReactNode;
}

export function TransitionWrapper( { children }: TransitionWrapperProps ) {
  const containerRef = useRef<HTMLDivElement>( null );

  useLayoutEffect( () => {
    const ctx = gsap.context( () => {
      // Set initial state to avoid SSR flicker
      gsap.set( ".animate-item", {
        y       : 20,
        opacity : 0,
      } );

      // Animate TO natural state
      gsap.to( ".animate-item", {
        duration   : 0.6,
        y          : 0,
        opacity    : 1,
        stagger    : 0.1,
        ease       : "power2.out",
        delay      : 0.1,
        clearProps : "all",
      } );
    }, containerRef );

    return () => ctx.revert();
  }, [] );

  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
}
