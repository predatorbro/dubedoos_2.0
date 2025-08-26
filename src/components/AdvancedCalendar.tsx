"use client"

import { useEffect, useState } from "react"
import {
  eachYearOfInterval,
  endOfYear,
  format,
  startOfYear,
} from "date-fns"
import { Plus, X } from "lucide-react"
import { CaptionLabel, MonthGrid } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { json } from "stream/consumers"

export default function AdvancedCalendar() {
  const today = new Date()
  const [month, setMonth] = useState(today)
  const [date, setDate] = useState<Date | undefined>(today)
  const [open, setOpen] = useState(false)
  const [newTodo, setNewTodo] = useState("")
  const [todos, setTodos] = useState<Record<string, string[]>>({})

  const startDate = new Date(2024, 12)
  const endDate = new Date(2026, 12)

  // types for custom components
  type CaptionLabelProps = React.HTMLAttributes<HTMLSpanElement>

  const handleDayClick = (day: Date) => {
    setDate(day)
    setOpen(true)
  }

  const handleAddTodo = () => {
    if (!date || !newTodo.trim()) return
    const key = format(date, "yyyy-MM-dd")
    setTodos((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), newTodo.trim()],
    }))
    setNewTodo("")
  }

  const handleDeleteTodo = (key: string, idx: number) => {
    setTodos((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== idx),
    }))
  }

  useEffect(() => {
    const storedTodos = localStorage.getItem("todosForCalendar")
    if (storedTodos) {
      setTodos(JSON.parse(storedTodos))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("todosForCalendar", JSON.stringify(todos))
  }, [todos])

  const handleMagic = () => {
    // future implementation if needed
  }

  return (
    <div className="w-full">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}

        month={month}
        onMonthChange={setMonth}
        defaultMonth={new Date()}
        startMonth={startDate}
        endMonth={endDate}
        onDayClick={handleDayClick}
        className="overflow-hidden rounded-md border-gray-800 dark:border-gray-200/50 border p-2 bg-transparent w-full"
        classNames={{
          caption: "flex items-center absolute",
          caption_label: "text-base lg:text-lg xl:text-2xl font-semibold",
          month_caption: "mt-4 mb-2 text-center",
          head_cell: "text-sm font-semibold",

          weekdays: "text-sm sm:text-base flex gap-2 mx-auto lg:mx-8 xl:mx-10 2xl:mx-15 mb-3", //day name
          week: "flex justify-between items-center gap-2 mx-auto lg:mx-8 xl:mx-10 2xl:mx-15", //

          nav: "absolute flex gap-5 top-3 right-3 xl:top-5 xl:right-5 ",
          nav_icon: "h-16 w-16 text-5xl",
          outside: "opacity-0 pointer-events-none",
          day_button: " sm:!text-base font-light xl:size-10 2xl:size-12",

          day: "flex items-center justify-center rounded-lg cursor-pointer  transition-colors hover:text-accent-foreground mx-auto my-2",

          today: "!bg-transparent border-2 border-primary !text-primary scale-120 hover:border-transparent",

          selected: "!bg-primary !text-primary-foreground hover:!bg-primary hover:!text-black ",
        }}


        modifiers={{
          hasTodos: (day) => {
            const key = format(day, "yyyy-MM-dd")
            return todos[key]?.length > 0
          },
        }}

        modifiersClassNames={{
          hasTodos: "bg-primary text-muted font-medium",
        }}

        components={{
          CaptionLabel: (props: CaptionLabelProps) => (
            <>
              <CaptionLabel
                {...props}
              />
              {/* Today Button on Left */}
              <button
                onClick={() => {
                  const today = new Date();
                  setDate(today);
                  setMonth(today);
                }}
                className=" absolute top-3 left-3 xl:top-5 xl:left-5 px-3 py-1 text-sm font-medium border rounded-md hover:bg-accent "
              >
                Today
              </button>
            </>

          ),

        }}
      />

      {/* Modal for todos */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {date ? format(date, "MMMM dd, yyyy") : "No Date"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add todo..."
              />
              <Button onClick={handleAddTodo} size="icon"
                className="aspect-square "
              >
                <Plus size={16} />
              </Button>
            </div>

            <div className="space-y-2">
              {date && todos[format(date, "yyyy-MM-dd")]?.map((todo, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center rounded-md border p-2 text-sm"
                  onDoubleClick={handleMagic}
                >
                  {todo}
                  <Button
                    onClick={() =>
                      handleDeleteTodo(format(date, "yyyy-MM-dd"), idx)
                    }
                    size="icon"
                    variant="ghost"
                  >
                    <X size={14} />
                  </Button>
                </div>
              ))}
              {date && (!todos[format(date, "yyyy-MM-dd")]?.length) && (
                <p className="text-muted-foreground text-sm">
                  No todos yet. Add one above.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
