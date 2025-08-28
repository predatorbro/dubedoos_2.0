"use client"

import { motion } from "framer-motion"

export default function Heartbeatdiv({ children, delay = 10 }: { children?: React.ReactNode, delay?: number }) {
    return (
        <motion.div
            animate={{
                scale: [1, 1.03, 0.97, 1], // grow → shrink → normal
            }}
            transition={{
                duration: 1,      // total time for one beat
                repeat: Infinity, // infinite loop
                repeatDelay: delay,  // wait between beats (like heartbeat rhythm)
                ease: "easeInOut",
            }}
        >
            {children}
        </motion.div>
    )
}
