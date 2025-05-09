"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
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
          <DialogTitle>現場を編集</DialogTitle>
          <DialogDescription>
            現場の詳細情報を編集できます。変更内容を保存するには「保存」ボタンをクリックしてください。
          </DialogDescription>
        </DialogHeader>
        <DealEditForm dealId={dealId} onSuccess={onClose} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  )
}
