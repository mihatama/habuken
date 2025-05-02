"use client"

import { Textarea } from "@/components/ui/textarea"

import * as React from "react"
import type { CalendarEvent } from "@/components/enhanced-calendar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface StaffAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventData: CalendarEvent | null
  onEventAdd?: (event: CalendarEvent) => void
  onEventUpdate?: (event: CalendarEvent) => void
  onEventDelete?: (eventId: number | string) => void
}

export function StaffAssignmentDialog({
  open,
  onOpenChange,
  eventData,
  onEventAdd,
  onEventUpdate,
  onEventDelete,
}: StaffAssignmentDialogProps) {
  const [title, setTitle] = React.useState(eventData?.title || "")
  const [description, setDescription] = React.useState(eventData?.description || "")
  const [start, setStart] = React.useState(eventData?.start || new Date())
  const [end, setEnd] = React.useState(eventData?.end || new Date())

  const handleSubmit = async () => {
    if (!eventData) return

    const updatedEvent = {
      ...eventData,
      title: title,
      description: description,
      start: start,
      end: end,
    }

    if (eventData.id === 0) {
      if (onEventAdd) {
        await onEventAdd(updatedEvent)
      }
    } else {
      if (onEventUpdate) {
        await onEventUpdate(updatedEvent)
      }
    }

    onOpenChange(false)
  }

  const handleDelete = async () => {
    if (!eventData || !eventData.id) return

    if (onEventDelete) {
      await onEventDelete(eventData.id)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{eventData?.id === 0 ? "Create Event" : "Edit Event"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event description"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Save
          </Button>
          {eventData?.id !== 0 && (
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
