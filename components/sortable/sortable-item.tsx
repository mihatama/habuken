"use client"

import type React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

type SortableItemProps = {
  id: string
  children: React.ReactNode
  className?: string
}

export function SortableItem({ id, children, className }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 p-2 rounded-md",
        isDragging ? "bg-muted/50 shadow-md z-10" : "",
        className,
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab touch-manipulation p-1 rounded hover:bg-muted"
        aria-label="ドラッグハンドル"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      {children}
    </div>
  )
}
