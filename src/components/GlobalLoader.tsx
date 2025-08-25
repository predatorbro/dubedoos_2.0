// components/GlobalLoader.tsx
"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, X } from "lucide-react"

export interface GlobalLoaderProps {
  showLoader?: boolean
  timeout?: number // in milliseconds
  onTimeout?: () => void
  message?: string
  dismissible?: boolean
}

export function GlobalLoader({
  showLoader = false,
  timeout = 10000, // 10 seconds default
  onTimeout,
  message = "Loading...",
  dismissible = false,
}: GlobalLoaderProps) {
  const [isVisible, setIsVisible] = useState(showLoader)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    let progressInterval: NodeJS.Timeout

    if (showLoader) {
      setIsVisible(true)
      setProgress(0)

      // Progress animation
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }
          return prev + 100 / (timeout / 100)
        })
      }, 100)

      // Timeout handler
      timeoutId = setTimeout(() => {
        setIsVisible(false)
        onTimeout?.()
      }, timeout)
    } else {
      setIsVisible(false)
    }

    return () => {
      clearTimeout(timeoutId)
      clearInterval(progressInterval)
    }
  }, [showLoader, timeout, onTimeout])

  const handleDismiss = () => {
    if (dismissible) {
      setIsVisible(false)
      onTimeout?.()
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-md overflow-hidden"
          onClick={dismissible ? handleDismiss : undefined}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 250 }}
            className="relative w-[340px] rounded-3xl border border-white/20 bg-gradient-to-br from-white/80 to-white/60 dark:from-zinc-900/80 dark:to-zinc-800/60 shadow-2xl backdrop-blur-xl p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {dismissible && (
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 rounded-full p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100/70 dark:hover:bg-zinc-700/60 transition-colors"
              >
                <X size={18} />
              </button>
            )}

            <div className="flex flex-col items-center space-y-6">
              {/* Loader animation */}
              <div className="relative flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 size={56} className="text-primary drop-shadow-lg" />
                </motion.div>

                {/* Pulsing outer glow */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute size-20 rounded-full bg-primary/30 blur-md"
                />
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-[260px] h-2 rounded-full bg-gray-200/60 dark:bg-zinc-700/70 overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.25 }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                />
              </div>

              {/* Message */}
              <motion.p
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-lg font-semibold text-center text-gray-800 dark:text-gray-200"
              >
                {message}
              </motion.p>

              {/* Timeout countdown */}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-sm text-gray-500 dark:text-gray-400"
              >
                Auto-dismiss in{" "}
                {Math.ceil((timeout - (progress * timeout) / 100) / 1000)}s
              </motion.span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
