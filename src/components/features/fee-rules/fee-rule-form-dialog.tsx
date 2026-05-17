'use client'

import { useRef, useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { FeeRuleForm } from './fee-rule-form'
import gsap from 'gsap'

export function FeeRuleFormDialog( {
  categories,
  initialData,
  trigger,
  existingCategoryIds,
}: {
  categories: any[]
  initialData?: any
  trigger?: React.ReactElement
  existingCategoryIds?: string[]
} ) {
  const [formLoading, setFormLoading] = useState( false )
  const [formValid, setFormValid] = useState( false )
  const isEditing = !!initialData?.id
  const formId = "fee-rule-form"

  const popupRef = useRef<HTMLDivElement>( null );
  const contentRef = useRef<HTMLDivElement>( null );
  const overlayRef = useRef<HTMLDivElement>( null );
  const actionsRef = useRef<{ unmount: () => void; close: () => void } | null>( null );
  const tlRef = useRef<gsap.core.Timeline | null>( null );
  const isAnimatingRef = useRef( false );

  const handlePopupRef = useCallback( ( node: HTMLDivElement | null ) => {
    popupRef.current = node;
    if ( !node ) return;

    tlRef.current?.kill();

    const content = contentRef.current;
    const overlay = overlayRef.current;

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

    if ( overlay ) {
      tl.to( overlay, {
        opacity  : 1,
        duration : 0.25,
        ease     : "power2.out",
      }, 0 );
    }

    tl.to( node, {
      scaleY   : 1,
      opacity  : 1,
      duration : 0.4,
      ease     : "power3.out",
    }, 0 );

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
    if ( nextOpen ) return;

    if ( isAnimatingRef.current ) return;
    isAnimatingRef.current = true;

    event.preventUnmountOnClose();

    tlRef.current?.kill();

    const tl = gsap.timeline( {
      onComplete : () => {
        isAnimatingRef.current = false;
        actionsRef.current?.unmount();
      },
    } );

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
              Aturan Baru
            </Button>
          )
        }
      />
      <DialogContent 
        ref={handlePopupRef}
        overlayRef={overlayRef}
        disableCssAnimation
        className="w-full max-w-full h-[100dvh] max-h-[100dvh] sm:h-auto sm:max-h-[calc(100vh-4rem)] p-4 sm:p-6 rounded-none sm:rounded-xl overflow-y-auto sm:max-w-[700px] flex flex-col origin-center"
      >
        <div ref={contentRef}
          className="contents"
        >
          <DialogHeader className="-mx-4 -mt-4 mb-4 px-4 py-4 sm:-mx-6 sm:-mt-6 sm:px-6 sm:py-6 border-b bg-muted/30 shrink-0">
            <DialogTitle>
              {isEditing ? 'Perbarui Aturan Fee' : 'Buat Aturan Fee'}
            </DialogTitle>
            <DialogDescription>
              Konfigurasi aturan perhitungan fee transaksi secara visual.
            </DialogDescription>
          </DialogHeader>
          <div className='-mx-4 no-scrollbar md:max-h-[70vh] overflow-y-auto px-4 grow flex flex-col'>
            <FeeRuleForm
              id={formId}
              categories={categories}
              initialData={initialData}
              existingCategoryIds={existingCategoryIds}
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
              {formLoading ? "Menyimpan..." : isEditing ? "Perbarui Aturan" : "Simpan Aturan"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
