'use client'

import { useState } from 'react'
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

export function FeeRuleFormDialog( {
  categories,
  initialData,
  trigger,
  existingCategoryIds,
}: {
  categories: any[]
  initialData?: any
  trigger?: React.ReactNode
  existingCategoryIds?: string[]
} ) {
  const [open, setOpen] = useState( false )
  const [formLoading, setFormLoading] = useState( false )
  const [formValid, setFormValid] = useState( false )
  const isEditing = !!initialData?.id
  const formId = "fee-rule-form"

  return (
    <Dialog open={open}
      onOpenChange={setOpen}
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
      <DialogContent className="w-full max-w-full h-[100dvh] max-h-[100dvh] sm:h-auto sm:max-h-[calc(100vh-4rem)] p-4 sm:p-6 rounded-none sm:rounded-xl overflow-y-auto sm:max-w-[700px] flex flex-col">
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
            onSuccess={() => setOpen( false )}
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
      </DialogContent>
    </Dialog>
  )
}
