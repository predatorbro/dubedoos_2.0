"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

export default function CalendarPopup() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [open, setOpen] = useState(false)

  // 1️⃣ Prevent past dates
  const today = new Date()

  return (
    <div className="flex flex-col items-center justify-center p-6">
      {/* Button to toggle calendar */}
      <Button onClick={() => setOpen(!open)} className="mb-4">
        {date ? `Selected: ${date.toDateString()}` : "Pick a Date"}
      </Button>

      {/* 4️⃣ AnimatePresence for popup */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="z-50 rounded-xl border bg-white p-4 shadow-lg"
          >
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                setDate(d)
                setOpen(false) // Close after selecting
              }}
              className="rounded-md border p-2"
              classNames={{
                day_button:
                  "rounded-full hover:bg-primary hover:text-white focus:bg-primary focus:text-white",
                day_selected: "bg-primary text-white rounded-full",
                day_today: "border border-primary rounded-full",
              }}
              disabled={{ before: today }} // 1️⃣ Disable past days
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
