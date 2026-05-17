"use client";

import { useRef, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { TransactionForm } from "./transaction-form";
import gsap from "gsap";

interface TransactionFormDialogProps {
  categories: any[];
  feeRules: any[];
  recentTransactions?: any[];
  initialData?: any;
  trigger?: React.ReactElement;
}

export function TransactionFormDialog( { 
  categories, 
  feeRules, 
  recentTransactions,
  initialData,
  trigger
}: TransactionFormDialogProps ) {
  const [formLoading, setFormLoading] = useState( false );
  const [formValid, setFormValid] = useState( false );
  const formId = `transaction-form-${initialData?.id || "new"}`;

  const popupRef = useRef<HTMLDivElement>( null );
  const contentRef = useRef<HTMLDivElement>( null );
  const overlayRef = useRef<HTMLDivElement>( null );
  const actionsRef = useRef<{ unmount: () => void; close: () => void } | null>( null );
  const tlRef = useRef<gsap.core.Timeline | null>( null );
  const isAnimatingRef = useRef( false );

  // Run enter animation whenever popup mounts
  const handlePopupRef = useCallback( ( node: HTMLDivElement | null ) => {
    popupRef.current = node;
    if ( !node ) return;

    // Kill any running timeline
    tlRef.current?.kill();

    const content = contentRef.current;
    const overlay = overlayRef.current;

    // Set initial states
    gsap.set( node, {
      scaleY          : 0,
      opacity         : 0,
      transformOrigin : "center center",
    } );
    if ( overlay ) gsap.set( overlay, { opacity : 0 } );
    if ( content?.children ) {
      gsap.set( content.children, {
        x       : -30,
        opacity : 0,
      } );
    }

    const tl = gsap.timeline();

    // Overlay fade in
    if ( overlay ) {
      tl.to( overlay, {
        opacity  : 1,
        duration : 0.25,
        ease     : "power2.out",
      }, 0 );
    }

    // Modal scales vertically from center
    tl.to( node, {
      scaleY   : 1,
      opacity  : 1,
      duration : 0.4,
      ease     : "power3.out",
    }, 0 );

    // Content/fields slide in from left with opacity
    if ( content?.children ) {
      tl.to(
        content.children,
        {
          x        : 0,
          opacity  : 1,
          duration : 0.35,
          stagger  : 0.05,
          ease     : "power2.out",
        },
        0.15
      );
    }

    tlRef.current = tl;
  }, [] );

  const handleOpenChange = useCallback( ( nextOpen: boolean, event: { preventUnmountOnClose: () => void } ) => {
    if ( nextOpen ) return; // Opening is handled by ref callback

    // Guard: don't re-enter if already animating out
    if ( isAnimatingRef.current ) return;
    isAnimatingRef.current = true;

    // Prevent base-ui from unmounting immediately — we animate out first
    event.preventUnmountOnClose();

    // Kill enter animation if still running
    tlRef.current?.kill();

    const tl = gsap.timeline( {
      onComplete : () => {
        isAnimatingRef.current = false;
        actionsRef.current?.unmount();
      },
    } );

    // Reverse: content slides out + fades, then modal scales down
    if ( contentRef.current ) {
      tl.to( contentRef.current.children, {
        x        : -30,
        opacity  : 0,
        duration : 0.25,
        stagger  : 0.03,
        ease     : "power2.in",
      } );
    }

    if ( popupRef.current ) {
      tl.to(
        popupRef.current,
        {
          scaleY   : 0,
          opacity  : 0,
          duration : 0.3,
          ease     : "power3.in",
        },
        "-=0.1"
      );
    }

    if ( overlayRef.current ) {
      tl.to(
        overlayRef.current,
        {
          opacity  : 0,
          duration : 0.2,
        },
        "-=0.2"
      );
    }

    tlRef.current = tl;
  }, [] );

  return (
    <Dialog
      onOpenChange={handleOpenChange}
      actionsRef={actionsRef}
    >
      <DialogTrigger
        render={
          trigger || (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Transaksi Baru
            </Button>
          )
        }
      />
      <DialogContent
        ref={handlePopupRef}
        overlayRef={overlayRef}
        disableCssAnimation
        className="w-full max-w-full h-dvh max-h-dvh sm:h-auto sm:max-h-[calc(100vh-4rem)] p-4 sm:p-6 rounded-none sm:rounded-xl overflow-y-auto sm:max-w-150 flex flex-col origin-center"
      >
        <div
          ref={contentRef}
          className="contents"
        >
          <DialogHeader className="-mx-4 -mt-4 mb-4 px-4 py-4 sm:-mx-6 sm:-mt-6 sm:px-6 sm:py-6 border-b bg-muted/30 shrink-0">
            <DialogTitle>{initialData ? "Ubah Transaksi" : "Buat Transaksi"}</DialogTitle>
            <DialogDescription>
              {initialData ? "Ubah rincian transaksi Anda." : "Masukkan rincian transaksi. Biaya fee akan dihitung secara otomatis berdasarkan aturan yang berlaku."}
            </DialogDescription>
          </DialogHeader>
          <div className="-mx-4 no-scrollbar overflow-y-auto px-4 grow flex flex-col">
            <TransactionForm 
              id={formId}
              initialData={initialData}
              categories={categories} 
              feeRules={feeRules} 
              recentTransactions={recentTransactions}
              onSuccess={() => actionsRef.current?.close()} 
              onLoadingChange={setFormLoading}
              onValidityChange={setFormValid}
            />
          </div>
          <DialogFooter className="-mx-4 -mb-4 mt-auto px-4 py-4 sm:-mx-6 sm:-mb-6 sm:px-6 sm:py-4 border-t bg-muted/30 shrink-0">
            <DialogClose render={<Button variant="outline">Batal</Button>} />
            <Button 
              form={formId} 
              type="submit" 
              disabled={formLoading || !formValid}
            >
              {formLoading ? "Menyimpan..." : ( initialData ? "Simpan Perubahan" : "Simpan Transaksi" )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
