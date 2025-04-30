"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "moment/locale/ja"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { CalendarIcon, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

// Set up the localizer
moment.locale("ja")
const localizer = momentLocalizer(moment)

export interface CalendarEvent {
  id: string | number
  title: string
  start: Date
  end: Date
  description?: string
  category?: string
  allDay?: boolean
  staff_id?: string | number
  [key: string]: any
}

interface Category {
  value: string
  label: string
}

interface EnhancedCalendarProps {
  events: CalendarEvent[]
  onEventAdd?: (event: CalendarEvent) => Promise<any>
  onEventUpdate?: (event: CalendarEvent) => Promise<any>
  onEventDelete?: (eventId: string | number) => Promise<any>
  isLoading?: boolean
  error?: string | null
  categories?: Category[]
  onRefresh?: () => void
}

export function EnhancedCalendar({
  events,
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  isLoading = false,
  error = null,
  categories = [],
  onRefresh,
}: EnhancedCalendarProps) {
  const [view, setView] = useState<"week" | "month">("week")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isNewEvent, setIsNewEvent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: "",
    start: new Date(),
    end: new Date(),
    description: "",
    category: categories.length > 0 ? categories[0].value : undefined,
  })

  const isMobile = useMediaQuery("(max-width: 768px)")
  const calendarRef = useRef<any>(null)

  // Reset form data when selected event changes
  useEffect(() => {
    if (selectedEvent) {
      setFormData({
        ...selectedEvent,
      })
    } else {
      const startTime = new Date()
      startTime.setHours(startTime.getHours() + 1, 0, 0, 0)

      const endTime = new Date(startTime)
      endTime.setHours(endTime.getHours() + 1)

      setFormData({
        title: "",
        start: startTime,
        end: endTime,
        description: "",
        category: categories.length > 0 ? categories[0].value : undefined,
      })
    }
  }, [selectedEvent, categories])

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedEvent(null)
    setIsNewEvent(true)
    setFormData({
      title: "",
      start,
      end,
      description: "",
      category: categories.length > 0 ? categories[0].value : undefined,
    })
    setIsDialogOpen(true)
  }

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsNewEvent(false)
    setIsDialogOpen(true)
  }

  const handleEventResize = async ({ event, start, end }: { event: CalendarEvent; start: Date; end: Date }) => {
    if (!onEventUpdate) return

    try {
      const updatedEvent = { ...event, start, end }
      await onEventUpdate(updatedEvent)
    } catch (error) {
      console.error("Failed to resize event:", error)
    }
  }

  const handleEventDrop = async ({ event, start, end }: { event: CalendarEvent; start: Date; end: Date }) => {
    if (!onEventUpdate) return

    try {
      const updatedEvent = { ...event, start, end }
      await onEventUpdate(updatedEvent)
    } catch (error) {
      console.error("Failed to move event:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: "start" | "end") => {
    const value = e.target.value
    const [date, time] = value.split("T")

    if (date && time) {
      const newDate = new Date(`${date}T${time}`)
      setFormData((prev) => ({ ...prev, [field]: newDate }))
    }
  }

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.start || !formData.end) return

    setIsSubmitting(true)

    try {
      if (isNewEvent) {
        if (onEventAdd) {
          await onEventAdd(formData as CalendarEvent)
        }
      } else if (selectedEvent && onEventUpdate) {
        await onEventUpdate({ ...selectedEvent, ...formData } as CalendarEvent)
      }

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Failed to save event:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedEvent || !onEventDelete) return

    setIsSubmitting(true)

    try {
      await onEventDelete(selectedEvent.id)
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Failed to delete event:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewChange = (newView: "week" | "month") => {
    setView(newView)
  }

  const handleNavigate = (action: "PREV" | "NEXT" | "TODAY") => {
    if (calendarRef.current) {
      const { onNavigate } = calendarRef.current.props
      onNavigate(action)
    }
  }

  const formatDateHeader = (date: Date) => {
    return moment(date).format("YYYY年M月")
  }

  // Custom event styling based on category
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = "#3182ce" // Default blue

    switch (event.category) {
      case "staff":
        backgroundColor = "#3182ce" // Blue
        break
      case "holiday":
        backgroundColor = "#e53e3e" // Red
        break
      case "training":
        backgroundColor = "#38a169" // Green
        break
      case "other":
        backgroundColor = "#805ad5" // Purple
        break
      case "tool":
        backgroundColor = "#dd6b20" // Orange
        break
      case "vehicle":
        backgroundColor = "#6b46c1" // Purple
        break
      case "project":
        backgroundColor = "#2c7a7b" // Teal
        break
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.8,
        color: "white",
        border: "0",
        display: "block",
      },
    }
  }

  // Format the date/time for the input fields
  const formatDateTimeForInput = (date: Date) => {
    return moment(date).format("YYYY-MM-DDTHH:mm")
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={onRefresh} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          再読み込み
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleNavigate("PREV")} aria-label="前の期間">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleNavigate("TODAY")} aria-label="今日">
            今日
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleNavigate("NEXT")} aria-label="次の期間">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="text-lg font-medium ml-2">{formatDateHeader(currentDate)}</div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={view === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewChange("week")}
              className="rounded-none"
            >
              週
            </Button>
            <Button
              variant={view === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewChange("month")}
              className="rounded-none"
            >
              月
            </Button>
          </div>

          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading} aria-label="更新">
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-grow" style={{ height: "70vh" }}>
        <Calendar
          ref={calendarRef}
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          views={{ week: true, month: true }}
          view={view}
          onView={(newView: any) => setView(newView)}
          date={currentDate}
          onNavigate={(date: Date) => setCurrentDate(date)}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          resizable
          onEventResize={handleEventResize}
          onEventDrop={handleEventDrop}
          popup
          tooltipAccessor={(event) => event.description || event.title}
          messages={{
            week: "週",
            month: "月",
            today: "今日",
            previous: "前へ",
            next: "次へ",
            showMore: (total) => `+${total} 件`,
          }}
          formats={{
            monthHeaderFormat: (date) => moment(date).format("YYYY年M月"),
            weekdayFormat: (date) => moment(date).format("ddd"),
            dayFormat: (date) => moment(date).format("D"),
            dayHeaderFormat: (date) => moment(date).format("M月D日(ddd)"),
            dayRangeHeaderFormat: ({ start, end }) =>
              `${moment(start).format("M月D日")} - ${moment(end).format("M月D日")}`,
            timeGutterFormat: (date) => moment(date).format("HH:mm"),
          }}
          components={{
            toolbar: () => null, // We're using our custom toolbar
          }}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isNewEvent ? "新しい予定を追加" : "予定を編集"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">タイトル</Label>
                <Input id="title" name="title" value={formData.title || ""} onChange={handleInputChange} required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start">開始日時</Label>
                  <div className="flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                    <Input
                      id="start"
                      type="datetime-local"
                      value={formatDateTimeForInput(formData.start as Date)}
                      onChange={(e) => handleDateChange(e, "start")}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="end">終了日時</Label>
                  <div className="flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                    <Input
                      id="end"
                      type="datetime-local"
                      value={formatDateTimeForInput(formData.end as Date)}
                      onChange={(e) => handleDateChange(e, "end")}
                      required
                    />
                  </div>
                </div>
              </div>

              {categories.length > 0 && (
                <div className="grid gap-2">
                  <Label htmlFor="category">カテゴリ</Label>
                  <Select value={formData.category || categories[0].value} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="カテゴリを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="description">詳細</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="flex justify-between sm:justify-between">
              <div>
                {!isNewEvent && onEventDelete && (
                  <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
                    削除
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "保存中..." : "保存"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
