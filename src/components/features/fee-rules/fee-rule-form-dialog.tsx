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
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Perbarui Aturan Fee' : 'Buat Aturan Fee'}
          </DialogTitle>
          <DialogDescription>
            Konfigurasi aturan perhitungan fee transaksi secara visual.
          </DialogDescription>
        </DialogHeader>
        <div className='-mx-4 no-scrollbar max-h-[70vh] overflow-y-auto px-4'>
          <FeeRuleForm
            id={formId}
            categories={categories}
            initialData={initialData}
            existingCategoryIds={existingCategoryIds}
            onSuccess={() => setOpen( false )}
            onLoadingChange={setFormLoading}
          />
        </div>
        <DialogFooter className="gap-2">
          <DialogClose render={<Button variant="outline">Batal</Button>} />
          <Button 
            form={formId} 
            type="submit" 
            disabled={formLoading}
          >
            {formLoading ? "Menyimpan..." : isEditing ? "Perbarui Aturan" : "Simpan Aturan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
