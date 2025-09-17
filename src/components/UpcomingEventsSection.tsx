"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, CheckCircle2, Circle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useDispatch, useSelector } from "react-redux"
import { selectCalendarTodos, toggleCalendarTodoStatus, deleteCalendarTodo, CalendarTodo, CalendarTodosState } from "@/store/features/calendarTodosSlice"
import CalendarOverlay from "./CalendarOverlay"
import { format, isAfter, parseISO, isToday, isBefore, startOfDay } from "date-fns"
import { toast } from "sonner"

const UpcomingEventsSection = () => {
  const dispatch = useDispatch()
  const allTodos = useSelector((state: { calendarTodos: CalendarTodosState }) => selectCalendarTodos(state))
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  // Filter and sort upcoming events (including today)
  const upcomingEvents = useMemo(() => {
    const today = startOfDay(new Date())
    return allTodos
      .filter((todo: CalendarTodo) => {
        const todoDate = parseISO(todo.date)
        return !isBefore(todoDate, today) // Include today and future events
      })
      .sort((a: CalendarTodo, b: CalendarTodo) => {
        return parseISO(a.date).getTime() - parseISO(b.date).getTime()
      })
      .slice(0, 5) // Show only next 5 events
  }, [allTodos])

  const handleToggleTodo = (todoId: string) => {
    dispatch(toggleCalendarTodoStatus(todoId))
    toast.success("Todo status updated!")
  }

  const handleDeleteTodo = (todoId: string) => {
    dispatch(deleteCalendarTodo(todoId))
    toast.success("Event deleted!")
  }

  const getRelativeDate = (dateString: string) => {
    const date = parseISO(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    if (diffDays <= 7) return `${diffDays} days`
    return format(date, "MMM dd")
  }

  const getDateColor = (dateString: string) => {
    const date = parseISO(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "text-destructive"
    if (diffDays === 1) return "text-orange-500"
    if (diffDays <= 3) return "text-yellow-500"
    return "text-muted-foreground"
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Upcoming Events</h2>
        <Button
          onClick={() => setIsCalendarOpen(true)}
          size="sm"
          variant="secondary"
          className="h-8 px-3"
        >
          Open
          <Calendar size={14} className="mr-2" />
        </Button>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {upcomingEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center py-8"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Calendar size={24} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No upcoming events
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add events to your calendar to see them here
              </p>
              <Button
                onClick={() => setIsCalendarOpen(true)}
                variant="outline"
                size="sm"
              >
                <Calendar size={16} className="mr-2" />
                Open Calendar
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <AnimatePresence>
                {upcomingEvents.map((todo: CalendarTodo, index: number) => (
                  <motion.div
                    key={todo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-md transition-shadow duration-200 border-border/50 group">
                      <CardContent className="p-2">
                        <div className="flex items-start gap-2">
                          {/* Status Toggle */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 mt-0.5 p-0 hover:bg-transparent"
                            onClick={() => handleToggleTodo(todo.id)}
                          >
                            {todo.status ? (
                              <CheckCircle2 size={14} className="text-green-500" />
                            ) : (
                              <Circle size={14} className="text-muted-foreground hover:text-primary" />
                            )}
                          </Button>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium mb-1 ${
                              todo.status ? 'line-through text-muted-foreground' : 'text-foreground'
                            }`}>
                              {todo.todo}
                            </p>
                            
                            {/* Date Info */}
                            <div className="flex items-center gap-2 text-xs">
                              <Clock size={10} className="text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {format(parseISO(todo.date), "MMM dd, yyyy")}
                              </span>
                              <span className={`font-medium ${getDateColor(todo.date)}`}>
                                ({getRelativeDate(todo.date)})
                              </span>
                            </div>
                          </div>

                          {/* Delete Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive p-0"
                            onClick={() => handleDeleteTodo(todo.id)}
                          >
                            <X size={12} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Show more events indicator */}
              {(() => {
                const totalUpcomingEvents = allTodos.filter((todo: CalendarTodo) => {
                  const todoDate = parseISO(todo.date)
                  return !isBefore(todoDate, startOfDay(new Date()))
                }).length
                const remainingEvents = totalUpcomingEvents - upcomingEvents.length
                
                return (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center pt-4"
                  >
                    {remainingEvents > 0 && (
                      <p className="text-xs text-muted-foreground pb-4">
                        And {remainingEvents} more event{remainingEvents === 1 ? '' : 's'}
                      </p>
                    )}
                    <Button
                      onClick={() => setIsCalendarOpen(true)}
                      variant="ghost"
                      size="sm"
                      className="text-xs h-auto p-1 px-3 w-fit  absolute bottom-1 left-1/2 -translate-x-1/2"
                    >
                      View all in calendar
                    </Button>
                  </motion.div>
                )
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced Calendar Overlay */}
      <CalendarOverlay 
        isOpen={isCalendarOpen} 
        onClose={() => setIsCalendarOpen(false)} 
      />
    </div>
  )
}

export default UpcomingEventsSection
