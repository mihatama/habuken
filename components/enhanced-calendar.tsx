"use client"

import type React from "react"
import { useRef, useEffect, useCallback, useMemo, useReducer, memo } from "react"
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

// カスタムCSSを追加して時間表示を非表示にする
const customStyles = `
  /* 時間表示を完全に非表示にする */
  .rbc-time-column {
    display: none !important;
  }
  
  .rbc-time-header-content {
    border-left: none !important;
  }
  
  .rbc-time-view .rbc-allday-cell {
    width: 100% !important;
    height: auto !important;
    min-height: 70vh !important;
  }
  
  .rbc-time-content {
    display: none !important;
  }
  
  .rbc-time-view {
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 100%;
    border: 1px solid #ddd;
  }
  
  .rbc-time-header {
    display: flex;
    flex: 1;
    min-height: 70vh;
  }
  
  .rbc-time-header-content {
    flex: 1;
    min-height: 70vh;
  }
  
  /* 時間のグリッド線を非表示 */
  .rbc-time-gutter {
    display: none !important;
  }
  
  /* スクロールバーを非表示 */
  .rbc-time-view .rbc-time-content::-webkit-scrollbar {
    display: none !important;
  }
`

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

export interface EnhancedCalendarProps {
  events: CalendarEvent[]
  onEventAdd?: ((event: CalendarEvent) => Promise<void>) | null
  onEventUpdate?: ((event: CalendarEvent) => Promise<void>) | null
  onEventDelete?: ((eventId: string) => Promise<void>) | null
  isLoading?: boolean
  error?: string | null
  categories?: { value: string; label: string }[]
  onRefresh?: () => void
  readOnly?: boolean
  defaultDate?: Date
}

// 状態管理用のreducer
type CalendarState = {
  view: "week" | "month"
  currentDate: Date
  selectedEvent: CalendarEvent | null
  isDialogOpen: boolean
  isNewEvent: boolean
  isSubmitting: boolean
  formData: Partial<CalendarEvent>
}

type CalendarAction =
  | { type: "SET_VIEW"; payload: "week" | "month" }
  | { type: "SET_CURRENT_DATE"; payload: Date }
  | { type: "SELECT_EVENT"; payload: CalendarEvent | null }
  | { type: "SET_DIALOG_OPEN"; payload: boolean }
  | { type: "SET_NEW_EVENT"; payload: boolean }
  | { type: "SET_SUBMITTING"; payload: boolean }
  | { type: "UPDATE_FORM_DATA"; payload: Partial<CalendarEvent> }
  | { type: "RESET_FORM_DATA"; payload: { categories: Category[]; startDate?: Date } }

function calendarReducer(state: CalendarState, action: CalendarAction): CalendarState {
  switch (action.type) {
    case "SET_VIEW":
      return { ...state, view: action.payload }
    case "SET_CURRENT_DATE":
      return { ...state, currentDate: action.payload }
    case "SELECT_EVENT":
      return { ...state, selectedEvent: action.payload }
    case "SET_DIALOG_OPEN":
      return { ...state, isDialogOpen: action.payload }
    case "SET_NEW_EVENT":
      return { ...state, isNewEvent: action.payload }
    case "SET_SUBMITTING":
      return { ...state, isSubmitting: action.payload }
    case "UPDATE_FORM_DATA":
      return { ...state, formData: { ...state.formData, ...action.payload } }
    case "RESET_FORM_DATA":
      const startTime = action.payload.startDate || new Date()
      startTime.setHours(0, 0, 0, 0)

      const endTime = new Date(startTime)
      endTime.setHours(23, 59, 59, 999)

      return {
        ...state,
        formData: {
          title: "",
          start: startTime,
          end: endTime,
          description: "",
          category: action.payload.categories.length > 0 ? action.payload.categories[0].value : undefined,
          allDay: true,
        },
      }
    default:
      return state
  }
}

// メモ化されたイベントコンポーネント
const EventItem = memo(({ event, onClick }: { event: CalendarEvent; onClick: () => void }) => {
  return (
    <div onClick={onClick} className="p-2 text-sm truncate" title={event.title}>
      {event.title}
    </div>
  )
})
EventItem.displayName = "EventItem"

// メモ化されたカレンダーヘッダーコンポーネント
const CalendarHeader = memo(
  ({
    currentDate,
    view,
    onViewChange,
    onNavigate,
    onRefresh,
    isLoading,
  }: {
    currentDate: Date
    view: "week" | "month"
    onViewChange: (view: "week" | "month") => void
    onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void
    onRefresh?: () => void
    isLoading?: boolean
  }) => {
    const formatDateHeader = useCallback((date: Date) => {
      return moment(date).format("YYYY年M月")
    }, [])

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onNavigate("PREV")} aria-label="前の期間">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onNavigate("TODAY")} aria-label="今日">
            今日
          </Button>
          <Button variant="outline" size="sm" onClick={() => onNavigate("NEXT")} aria-label="次の期間">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="text-lg font-medium ml-2">{formatDateHeader(currentDate)}</div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={view === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("week")}
              className="rounded-none"
            >
              週
            </Button>
            <Button
              variant={view === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("month")}
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
    )
  },
)
CalendarHeader.displayName = "CalendarHeader"

// メモ化されたイベントフォームコンポーネント
const EventForm = memo(
  ({
    formData,
    isNewEvent,
    isSubmitting,
    categories,
    onInputChange,
    onDateChange,
    onCategoryChange,
    onSubmit,
    onDelete,
    onCancel,
  }: {
    formData: Partial<CalendarEvent>
    isNewEvent: boolean
    isSubmitting: boolean
    categories: Category[]
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    onDateChange: (e: React.ChangeEvent<HTMLInputElement>, field: "start" | "end") => void
    onCategoryChange: (value: string) => void
    onSubmit: (e: React.FormEvent) => void
    onDelete: () => void
    onCancel: () => void
  }) => {
    // Format the date/time for the input fields
    const formatDateForInput = useCallback((date: Date) => {
      return moment(date).format("YYYY-MM-DD")
    }, [])

    return (
      <form onSubmit={onSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">タイトル</Label>
            <Input id="title" name="title" value={formData.title || ""} onChange={onInputChange} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start">開始日</Label>
              <div className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                <Input
                  id="start"
                  type="date"
                  value={formData.start ? formatDateForInput(formData.start as Date) : ""}
                  onChange={(e) => onDateChange(e, "start")}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="end">終了日</Label>
              <div className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                <Input
                  id="end"
                  type="date"
                  value={formData.end ? formatDateForInput(formData.end as Date) : ""}
                  onChange={(e) => onDateChange(e, "end")}
                  required
                />
              </div>
            </div>
          </div>

          {categories.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="category">カテゴリ</Label>
              <Select value={formData.category || categories[0].value} onValueChange={onCategoryChange}>
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
              onChange={onInputChange}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <div>
            {!isNewEvent && (
              <Button type="button" variant="destructive" onClick={onDelete} disabled={isSubmitting}>
                削除
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : "保存"}
            </Button>
          </div>
        </DialogFooter>
      </form>
    )
  },
)
EventForm.displayName = "EventForm"

// メインのEnhancedCalendarコンポーネント
export function EnhancedCalendar({
  events,
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  isLoading = false,
  error = null,
  categories = [],
  onRefresh,
  readOnly = false,
  defaultDate,
}: EnhancedCalendarProps) {
  // useReducerを使用して関連する状態を一元管理
  const [state, dispatch] = useReducer(calendarReducer, {
    view: "week",
    currentDate: defaultDate || new Date(),
    selectedEvent: null,
    isDialogOpen: false,
    isNewEvent: false,
    isSubmitting: false,
    formData: {
      title: "",
      start: new Date(),
      end: new Date(),
      description: "",
      category: categories.length > 0 ? categories[0].value : undefined,
      allDay: true,
    },
  })

  const { view, currentDate, selectedEvent, isDialogOpen, isNewEvent, isSubmitting, formData } = state

  const isMobile = useMediaQuery("(max-width: 768px)")
  const calendarRef = useRef<any>(null)

  // すべてのイベントを終日イベントとして処理し、メモ化
  const processedEvents = useMemo(
    () =>
      events.map((event) => ({
        ...event,
        allDay: true,
      })),
    [events],
  )

  // Reset form data when selected event changes
  useEffect(() => {
    if (selectedEvent) {
      dispatch({ type: "UPDATE_FORM_DATA", payload: { ...selectedEvent } })
    } else {
      dispatch({ type: "RESET_FORM_DATA", payload: { categories } })
    }
  }, [selectedEvent, categories])

  // メモ化されたイベントハンドラ
  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      // If in read-only mode, don't allow creating new events
      if (readOnly) return

      // 選択された日の開始と終了を設定
      const startDate = new Date(start)
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(start)
      endDate.setHours(23, 59, 59, 999)

      dispatch({ type: "SELECT_EVENT", payload: null })
      dispatch({ type: "SET_NEW_EVENT", payload: true })
      dispatch({
        type: "UPDATE_FORM_DATA",
        payload: {
          title: "",
          start: startDate,
          end: endDate,
          description: "",
          category: categories.length > 0 ? categories[0].value : undefined,
          allDay: true,
        },
      })
      dispatch({ type: "SET_DIALOG_OPEN", payload: true })
    },
    [readOnly, categories],
  )

  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      // If in read-only mode, show event details but don't allow editing
      if (readOnly) {
        // You could implement a read-only view of the event here if desired
        return
      }

      dispatch({ type: "SELECT_EVENT", payload: event })
      dispatch({ type: "SET_NEW_EVENT", payload: false })
      dispatch({ type: "SET_DIALOG_OPEN", payload: true })
    },
    [readOnly],
  )

  const handleEventResize = useCallback(
    async ({ event, start, end }: { event: CalendarEvent; start: Date; end: Date }) => {
      // Disable in read-only mode
      if (readOnly) return
      if (!onEventUpdate) return

      try {
        const updatedEvent = { ...event, start, end, allDay: true }
        await onEventUpdate(updatedEvent)
      } catch (error) {
        console.error("Failed to resize event:", error)
      }
    },
    [readOnly, onEventUpdate],
  )

  const handleEventDrop = useCallback(
    async ({ event, start, end }: { event: CalendarEvent; start: Date; end: Date }) => {
      // Disable in read-only mode
      if (readOnly) return
      if (!onEventUpdate) return

      try {
        const updatedEvent = { ...event, start, end, allDay: true }
        await onEventUpdate(updatedEvent)
      } catch (error) {
        console.error("Failed to move event:", error)
      }
    },
    [readOnly, onEventUpdate],
  )

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    dispatch({ type: "UPDATE_FORM_DATA", payload: { [name]: value } })
  }, [])

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, field: "start" | "end") => {
    const value = e.target.value
    const [date] = value.split("T")

    if (date) {
      let newDate = new Date(`${date}T00:00:00`)

      // 終了日の場合は23:59:59に設定
      if (field === "end") {
        newDate = new Date(`${date}T23:59:59`)
      }

      dispatch({ type: "UPDATE_FORM_DATA", payload: { [field]: newDate } })
    }
  }, [])

  const handleCategoryChange = useCallback((value: string) => {
    dispatch({ type: "UPDATE_FORM_DATA", payload: { category: value } })
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (readOnly) return
      if (!formData.title || !formData.start || !formData.end) return

      dispatch({ type: "SET_SUBMITTING", payload: true })

      try {
        // 必ず終日イベントとして保存
        const eventData = {
          ...formData,
          allDay: true,
        }

        if (isNewEvent) {
          if (onEventAdd) {
            await onEventAdd(eventData as CalendarEvent)
          }
        } else if (selectedEvent && onEventUpdate) {
          await onEventUpdate({ ...selectedEvent, ...eventData } as CalendarEvent)
        }

        dispatch({ type: "SET_DIALOG_OPEN", payload: false })
      } catch (error) {
        console.error("Failed to save event:", error)
      } finally {
        dispatch({ type: "SET_SUBMITTING", payload: false })
      }
    },
    [readOnly, formData, isNewEvent, onEventAdd, selectedEvent, onEventUpdate],
  )

  const handleDelete = useCallback(async () => {
    if (readOnly) return
    if (!selectedEvent || !onEventDelete) return

    dispatch({ type: "SET_SUBMITTING", payload: true })

    try {
      await onEventDelete(selectedEvent.id as string)
      dispatch({ type: "SET_DIALOG_OPEN", payload: false })
    } catch (error) {
      console.error("Failed to delete event:", error)
    } finally {
      dispatch({ type: "SET_SUBMITTING", payload: false })
    }
  }, [readOnly, selectedEvent, onEventDelete])

  const handleViewChange = useCallback((newView: "week" | "month") => {
    dispatch({ type: "SET_VIEW", payload: newView })
  }, [])

  const handleNavigate = useCallback((action: "PREV" | "NEXT" | "TODAY") => {
    if (calendarRef.current) {
      const { onNavigate } = calendarRef.current.props
      onNavigate(action)
    }
  }, [])

  // Custom event styling based on category - メモ化
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    let backgroundColor = "#3182ce" // Default blue
    const textColor = "white"
    let fontStyle = "normal"
    let opacity = 0.8

    switch (event.category) {
      case "deal":
        backgroundColor = "rgba(59, 130, 246, 0.2)" // 薄い青色
        opacity = 1
        return {
          style: {
            backgroundColor,
            borderRadius: "4px",
            opacity,
            color: "#1e40af", // 濃い青色のテキスト
            border: "1px solid #3b82f6", // 青色のボーダー
            display: "block",
            fontStyle: "normal",
            fontWeight: "bold",
          },
        }
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

    // 半日休暇の場合のスタイル調整
    if (event.leave_duration === "am_only") {
      fontStyle = "italic"
      opacity = 0.7
      backgroundColor = "#f56565" // 午前休の色を少し明るく
    } else if (event.leave_duration === "pm_only") {
      fontStyle = "italic"
      opacity = 0.7
      backgroundColor = "#fc8181" // 午後休の色をさらに明るく
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity,
        color: textColor,
        border: "0",
        display: "block",
        fontStyle,
      },
    }
  }, [])

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
      {/* カスタムCSSをページに挿入 */}
      <style>{customStyles}</style>

      {/* メモ化されたヘッダーコンポーネント */}
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={handleViewChange}
        onNavigate={handleNavigate}
        onRefresh={onRefresh}
        isLoading={isLoading}
      />

      <div className="flex-grow" style={{ height: "70vh" }}>
        <Calendar
          ref={calendarRef}
          localizer={localizer}
          events={processedEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          views={{
            week: true,
            month: true,
          }}
          view={view}
          onView={(newView: any) => dispatch({ type: "SET_VIEW", payload: newView })}
          date={currentDate}
          onNavigate={(date: Date) => dispatch({ type: "SET_CURRENT_DATE", payload: date })}
          selectable={!readOnly}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          resizable={!readOnly}
          onEventResize={handleEventResize}
          draggableAccessor={() => !readOnly}
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
          }}
          components={{
            toolbar: () => null, // We're using our custom toolbar
          }}
        />
      </div>

      {/* Only render the dialog if not in read-only mode */}
      {!readOnly && (
        <Dialog open={isDialogOpen} onOpenChange={(open) => dispatch({ type: "SET_DIALOG_OPEN", payload: open })}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{isNewEvent ? "新しい予定を追加" : "予定を編集"}</DialogTitle>
            </DialogHeader>
            <EventForm
              formData={formData}
              isNewEvent={isNewEvent}
              isSubmitting={isSubmitting}
              categories={categories}
              onInputChange={handleInputChange}
              onDateChange={handleDateChange}
              onCategoryChange={handleCategoryChange}
              onSubmit={handleSubmit}
              onDelete={handleDelete}
              onCancel={() => dispatch({ type: "SET_DIALOG_OPEN", payload: false })}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
