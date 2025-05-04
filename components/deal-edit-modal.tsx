"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DealEditForm } from "@/components/deal-edit-form"

interface DealEditModalProps {
  dealId: string
  isOpen: boolean
  onClose: () => void
}

export function DealEditModal({ dealId, isOpen, onClose }: DealEditModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>案件を編集</DialogTitle>
        </DialogHeader>
        <DealEditForm dealId={dealId} onSuccess={onClose} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  )
}
