"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

interface TransitionWrapperProps {
  children: React.ReactNode;
}

export function TransitionWrapper({ children }: TransitionWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".animate-item", {
        duration: 0.6,
        y: 20,
        opacity: 0,
        stagger: 0.1,
        ease: "power2.out",
        clearProps: "all", // Ensures no weird inline styles remain after animation
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
}
