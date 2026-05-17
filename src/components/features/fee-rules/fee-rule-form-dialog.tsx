'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { FeeRuleForm } from './fee-rule-form'

export function FeeRuleFormDialog( {
  categories,
  initialData,
  trigger,
}: {
  categories: any[]
  initialData?: any
  trigger?: React.ReactNode
} ) {
  const [open, setOpen] = useState( false )
  const isEditing = !!initialData?.id

  return (
    <Dialog open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger
        render={
          trigger || (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Rule
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Fee Rule' : 'Create Fee Rule'}
          </DialogTitle>
          <DialogDescription>
            Configure dynamic fee calculation rules visually.
          </DialogDescription>
        </DialogHeader>
        <FeeRuleForm
          categories={categories}
          initialData={initialData}
          onSuccess={() => setOpen( false )}
        />
      </DialogContent>
    </Dialog>
  )
}
