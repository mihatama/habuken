"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function ScrollableDialogExample() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">長いコンテンツのダイアログを開く</Button>
      </DialogTrigger>
      <DialogContent allowScroll={true} className="w-full max-w-lg">
        <DialogHeader>
          <DialogTitle>スクロール可能なダイアログ</DialogTitle>
        </DialogHeader>
        <div className="dialog-content-scroll">
          {/* 長いコンテンツ */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="mb-4 p-4 border rounded">
              <h3 className="text-lg font-medium">セクション {i + 1}</h3>
              <p>
                これは長いコンテンツの例です。ダイアログ内でスクロールできることを確認するために、
                複数の段落を表示しています。実際のコンテンツはこれよりも長くなる可能性があります。
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
