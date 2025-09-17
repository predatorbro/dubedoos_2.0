'use client'
import NavBar from '@/components/myComponents/NavBar'
import StreakCalendar from '@/components/myComponents/StreakCalendar'
import { GlobalLoader } from '@/components/GlobalLoader'
import { useState } from 'react'
import { motion } from 'framer-motion'
import ChatBot from '@/components/myComponents/ChatBot'

function StreakCalendarPage() {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <>
      <GlobalLoader
        showLoader={isLoading}
        timeout={500}
        message="Loading streak calendar..."
        onTimeout={() => setIsLoading(false)}
      />

      {/* Content with staggered animations */}
      <div className={isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'}>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={!isLoading ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.4 }}
        >
          <div className="p-2 xl:p-3">
            <NavBar />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={!isLoading ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="container mx-auto px-4 py-8">
            <StreakCalendar />
          </div>
        </motion.div>
        <ChatBot />
      </div >
    </>
  )
}

export default StreakCalendarPage
