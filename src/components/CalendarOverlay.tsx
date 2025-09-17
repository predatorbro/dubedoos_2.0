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
import {
    selectCalendarTodos,
    toggleCalendarTodoStatus,
    deleteCalendarTodo,
    CalendarTodo,
    CalendarTodosState,
} from "@/store/features/calendarTodosSlice"
import AdvancedCalendar from "./AdvancedCalendar"
import { format, isBefore, parseISO, startOfDay } from "date-fns"
import { toast } from "sonner"

interface CalendarOverlayProps {
    isOpen: boolean
    onClose: () => void
}

const CalendarOverlay = ({ isOpen, onClose }: CalendarOverlayProps) => {
    const dispatch = useDispatch()
    const allTodos = useSelector((state: { calendarTodos: CalendarTodosState }) =>
        selectCalendarTodos(state)
    )

    // Filter past events (before today)
    const pastEvents = useMemo(() => {
        const today = startOfDay(new Date())
        return allTodos
            .filter((todo: CalendarTodo) => {
                const todoDate = parseISO(todo.date)
                return isBefore(todoDate, today)
            })
            .sort(
                (a: CalendarTodo, b: CalendarTodo) =>
                    parseISO(b.date).getTime() - parseISO(a.date).getTime()
            )
    }, [allTodos])

    // Filter upcoming events (today and future)
    const upcomingEvents = useMemo(() => {
        const today = startOfDay(new Date())
        return allTodos
            .filter((todo: CalendarTodo) => {
                const todoDate = parseISO(todo.date)
                return !isBefore(todoDate, today)
            })
            .sort(
                (a: CalendarTodo, b: CalendarTodo) =>
                    parseISO(a.date).getTime() - parseISO(b.date).getTime()
            )
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
        const today = startOfDay(new Date())
        const diffTime = date.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return "Today"
        if (diffDays === 1) return "Tomorrow"
        if (diffDays > 0 && diffDays <= 7) return `${diffDays} days`
        if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`
        return format(date, "MMM dd")
    }

    const getDateColor = (dateString: string) => {
        const date = parseISO(dateString)
        const today = startOfDay(new Date())
        const diffTime = date.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return "text-destructive"
        if (diffDays === 1) return "text-orange-500"
        if (diffDays > 0 && diffDays <= 3) return "text-yellow-500"
        if (diffDays < 0) return "text-muted-foreground"
        return "text-muted-foreground"
    }

    const EventCard = ({ todo, index }: { todo: CalendarTodo; index: number }) => (
        <motion.div
            key={todo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
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
                                <Circle
                                    size={14}
                                    className="text-muted-foreground hover:text-primary"
                                />
                            )}
                        </Button>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <p
                                className={`text-sm font-medium mb-1 ${todo.status
                                    ? "line-through text-muted-foreground"
                                    : "text-foreground"
                                    }`}
                            >
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
    )

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-7xl min-w-[90vw] max-h-full sm:max-h-[90vh] bg-card border shadow-lg p-6 gap-0 rounded-none sm:rounded-2xl">
                <DialogHeader className="px-6 pb-4 border-b">
                    <DialogTitle className="text-xl font-semibold text-center text-primary">
                        Calendar & Events
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col xl:flex-row h-[calc(90vh-120px)] xl:overflow-hidden">

                    {/* Past Events - Left Side (Desktop) / Bottom (Mobile) */}
                    <div className="w-full xl:w-1/4 p-4 border-b xl:border-b-0 xl:border-r order-3 xl:order-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                            <Calendar size={16} className="text-muted-foreground" />
                            <h3 className="text-lg font-semibold text-foreground">
                                Past Events
                            </h3>
                        </div>

                        <div className="h-[340px] xl:h-full xl:flex-1 overflow-y-auto space-y-2 min-h-0">
                            <AnimatePresence>
                                {pastEvents.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center justify-center h-full text-center py-8"
                                    >
                                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                                            <Calendar size={20} className="text-muted-foreground" />
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            No past events
                                        </p>
                                    </motion.div>
                                ) : (
                                    pastEvents.map((todo, index) => (
                                        <EventCard key={todo.id} todo={todo} index={index} />
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
 
                    <div className="flex-1 sm:p-6 border-b xl:border-b-0 xl:border-r order-1 xl:order-2">
                        <div className="h-full w-full overflow-hidden">
                            <AdvancedCalendar />
                        </div>
                    </div>

                    {/* Upcoming Events - Right Side (Desktop) / Middle (Mobile) */}
                    <div className="w-full xl:w-1/4 p-4 order-2 xl:order-3  flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar size={16} className="text-muted-foreground" />
                            <h3 className="text-lg font-semibold text-foreground">
                                Upcoming Events
                            </h3>
                        </div>

                        <div className="h-[340px] xl:h-full xl:flex-1 overflow-y-auto space-y-2 min-h-0">
                            <AnimatePresence>
                                {upcomingEvents.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center justify-center h-full text-center py-8"
                                    >
                                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                                            <Calendar size={20} className="text-muted-foreground" />
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            No upcoming events
                                        </p>
                                    </motion.div>
                                ) : (
                                    upcomingEvents.map((todo, index) => (
                                        <EventCard key={todo.id} todo={todo} index={index} />
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default CalendarOverlay
