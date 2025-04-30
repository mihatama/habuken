"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DealRegistrationForm } from "@/components/deal-registration-form"
import { PlusCircle } from "lucide-react"

export function DealRegistrationModal() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          新規案件登録
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新規案件登録</DialogTitle>
        </DialogHeader>
        <DealRegistrationForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
