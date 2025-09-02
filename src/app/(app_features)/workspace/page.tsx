'use client'
import NavBar from '@/components/myComponents/NavBar'
import CompleteSection from '@/components/myComponents/CompleteSection'
import { GlobalLoader } from '@/components/GlobalLoader'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { SideBarCustom } from '@/components/myComponents/SideBarCustom'
import ChatBot from '@/components/myComponents/ChatBot'

function App() {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <>
      <GlobalLoader
        showLoader={isLoading}
        timeout={500}
        message="Loading content..."
        onTimeout={() => setIsLoading(false)}
      />

      {/* Content with staggered animations */}
      <div className={isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'}>
        <SideBarCustom>
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
            <div className="px-2 xl:px-3">
              <CompleteSection />
            </div>
          </motion.div>
        </SideBarCustom>
        <ChatBot />
      </div >

    </>
  )
}

export default App