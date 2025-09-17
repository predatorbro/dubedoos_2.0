"use client"

import { memo, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  format,
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
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import {
  addCalendarTodo,
  deleteCalendarTodo,
  toggleCalendarTodoStatus,
  selectTodosForDate,
  CalendarTodo,
  CalendarTodosState
} from "@/store/features/calendarTodosSlice"

function AdvancedCalendar() {
  const dispatch = useDispatch()
  const today = new Date()
  const [month, setMonth] = useState(today)
  const [date, setDate] = useState<Date | undefined>(today)
  const [showTodoEditor, setShowTodoEditor] = useState(false)
  const [newTodo, setNewTodo] = useState("")
  const [calendarId] = useState("advanced-calendar") // Default calendar ID for this component

  const startDate = new Date(2024, 12)
  const endDate = new Date(2026, 12)

  // Get todos for the currently selected date
  const currentDateTodos = useSelector((state: { calendarTodos: CalendarTodosState }) =>
    date ? selectTodosForDate(state, format(date, "yyyy-MM-dd")) : []
  ).filter((todo: CalendarTodo) => todo.calendarId === calendarId)

  // Get all todos for calendar highlighting
  const allTodos = useSelector((state: { calendarTodos: CalendarTodosState }) => state.calendarTodos.calendarTodos)
    .filter((todo: CalendarTodo) => todo.calendarId === calendarId)

  // types for custom components
  type CaptionLabelProps = React.HTMLAttributes<HTMLSpanElement>

  const handleDayClick = (day: Date) => {
    setDate(day)
    setShowTodoEditor(true)
  }

  const handleAddTodo = () => {
    if (!date || !newTodo.trim()) return
    dispatch(addCalendarTodo({
      todo: newTodo.trim(),
      date: format(date, "yyyy-MM-dd"),
      calendarId
    }))
    setNewTodo("")
    toast.success("Todo added successfully!")
  }

  const handleCloseEditor = () => {
    setShowTodoEditor(false)
    setNewTodo("")
  }

  const handleDeleteTodo = (todoId: string) => {
    dispatch(deleteCalendarTodo(todoId))
    toast.success("Todo deleted successfully!")
  }

  const handleToggleTodo = (todoId: string) => {
    dispatch(toggleCalendarTodoStatus(todoId))
  }

  const handleMagic = () => {
    // future implementation if needed
  }

  return (
    <>
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full max-w-lg relative">
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
            className="overflow-hidden sm:rounded-md border p-2 bg-transparent w-full"
            classNames={{
              caption: "flex items-center absolute",
              caption_label: "text-base lg:text-lg xl:text-2xl font-semibold",
              month_caption: "mt-4 mb-2 text-center",
              head_cell: "text-sm font-semibold",

              // weekdays: "!text-base flex gap-2 mx-auto lg:mx-8 xl:mx-10 2xl:mx-15 mb-3", //day name
              weekdays: "!text-base flex gap-2 mx-auto lg:mx-8 xl:mx-10 2xl:mx-15 mb-3", //day name
              week: "flex justify-between items-center gap-2 mx-auto lg:mx-8 xl:mx-10 2xl:mx-15", //
              // week: "flex justify-between items-center gap-2 mx-auto lg:mx-8 xl:mx-10 2xl:mx-15", //

              nav: "absolute flex gap-5 top-3 right-3 xl:top-5 xl:right-5 ",
              nav_icon: "h-16 w-16 text-5xl",
              outside: "opacity-0 pointer-events-none",
              day_button: "!text-base font-light size-auto sm:size-10 2xl:size-12",

              day: "flex items-center justify-center rounded-lg cursor-pointer  transition-colors hover:text-accent-foreground mx-auto my-2",

              today: "!bg-transparent border-2 border-primary !text-primary scale-120 hover:border-transparent",

              selected: "!bg-primary !text-primary-foreground hover:!bg-primary hover:!text-black ",
            }}


            modifiers={{
              hasTodos: (day) => {
                const dateKey = format(day, "yyyy-MM-dd")
                return allTodos.some((todo: CalendarTodo) => todo.date === dateKey)
              },
            }}

            modifiersClassNames={{
              hasTodos: "bg-primary text-primary-foreground font-medium border-2 border-primary/50",
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
                    className="absolute top-3 sm:top-4 md:top-5 left-3 sm:left-4 md:left-5 px-3 py-1 text-sm font-medium border rounded-md hover:bg-accent transition-colors"
                  >
                    Today
                  </button>
                </>

              ),


            }}
          />

          {/* Inline Todo Editor Overlay */}
          {showTodoEditor && (
            <div className="absolute inset-0 bg-card border rounded-md shadow-lg p-4 z-10">
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b">
                  <h3 className="text-lg font-semibold text-primary">
                    {date ? format(date, "MMMM dd, yyyy") : "No Date"}
                  </h3>
                  <Button
                    onClick={handleCloseEditor}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <X size={16} />
                  </Button>
                </div>

                {/* Add Todo Input */}
                <div className="flex gap-3 p-2 sm:p-3 bg-muted/30 rounded-lg mb-4">
                  <Input
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="Add a new todo..."
                    className="flex-1 border-0 bg-transparent focus:ring-1 focus:ring-primary/20"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
                    autoFocus
                  />
                  <Button
                    onClick={handleAddTodo}
                    size="icon"
                    className="bg-primary hover:bg-primary/90 shadow-sm"
                    disabled={!newTodo.trim()}
                  >
                    <Plus size={16} />
                  </Button>
                </div>

                {/* Todos List */}
                <div className="flex-1 overflow-y-auto space-y-2">
                  {currentDateTodos.map((todo) => (
                    <div
                      key={todo.id}
                      className="flex justify-between items-center p-2 sm:p-3 border rounded-lg hover:bg-accent/50 hover:shadow-sm transition-all duration-200 group"
                      onDoubleClick={handleMagic}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          checked={todo.status}
                          onCheckedChange={() => handleToggleTodo(todo.id)}
                          className="mt-0.5"
                        />
                        <span
                          className={`text-sm flex-1 ${todo.status ? 'line-through text-muted-foreground' : ''}`}
                        >
                          {todo.todo}
                        </span>
                      </div>
                      <Button
                        onClick={() => handleDeleteTodo(todo.id)}
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ))}

                  {currentDateTodos.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                        <Plus size={20} className="text-primary/60" />
                      </div>
                      <p className="text-muted-foreground text-sm">
                        No todos yet. Add one above.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
export default memo(AdvancedCalendar)
