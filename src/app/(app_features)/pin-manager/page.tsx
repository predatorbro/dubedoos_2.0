// app/pin-manager/page.tsx (or wherever you render this page)
"use client"

import { useEffect, useRef, useState } from "react"
import { OTPInput, SlotProps } from "input-otp"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sparkles, RefreshCcw } from "lucide-react"
import { motion } from "framer-motion"
import { GlobalLoader } from "@/components/GlobalLoader"
import bcrypt from "bcryptjs"
import { toast, Toaster } from "sonner"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { LoaderOne } from "@/components/ui/loader"

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const { data: session } = useSession()

  if (session === undefined || !session) {
    return (
      <div className='h-lvh w-lvw bg-foreground flex items-center justify-center'>
        <LoaderOne />
      </div>
    )
  } else {
    return (
      <>
        <GlobalLoader
          showLoader={isLoading}
          timeout={500}
          message="Loading content..."
          onTimeout={() => setIsLoading(false)}
        />

        <div className={isLoading ? "opacity-0 pointer-events-none" : "opacity-100"}>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={!isLoading ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.4 }}
          >
            <PinManagerPage />
          </motion.div>
        </div>
      </>
    )
  }
}

function PinManagerPage() {
  const router = useRouter()

  // determine mode from LS
  const [pinExists, setPinExists] = useState<boolean | null>(null)

  // fields
  const [currentPin, setCurrentPin] = useState("")
  const [newPin, setNewPin] = useState("")

  // focus refs
  const currentRef = useRef<HTMLInputElement>(null)
  const newRef = useRef<HTMLInputElement>(null)

  // decide mode on load
  useEffect(() => {
    const saved = localStorage.getItem("userPinHash")
    setPinExists(!!saved)
    const savedTheme = localStorage.getItem("theme")
    document.body.classList.add(savedTheme!)
  }, [])

  // autofocus correct field once mode is known
  useEffect(() => {
    if (pinExists === null) return
    const focus = () => {
      if (pinExists) {
        currentRef.current?.focus()
      } else {
        newRef.current?.focus()
      }
    }
    // Focus after paint to ensure OTP renders
    const id = setTimeout(focus, 50)
    return () => clearTimeout(id)
  }, [pinExists])

  // helpers
  const redirectWithToast = (msg: string) => {
    const promise = () => new Promise((resolve) => setTimeout(() => resolve({ name: 'Sonner' }), 3000));
    toast.success(`${msg}`)
    toast.promise(promise, {
      loading: 'Redirecting to /workspace in 3s...',
      success: () => {
        return `Redirected to /workspace.`;
      },
      error: 'Error',
    });
    setTimeout(() => router.push("/workspace"), 2500)
  }

  const isFourDigits = (s: string) => /^\d{4}$/.test(s)

  const handleSetPin = async () => {
    if (!isFourDigits(newPin)) {
      toast.error("PIN must be exactly 4 digits")
      return
    }
    const hash = await bcrypt.hash(newPin, 10)
    localStorage.setItem("userPinHash", hash)
    redirectWithToast("PIN set successfully ✅")
  }

  const handleResetPin = async () => {
    const savedHash = localStorage.getItem("userPinHash")
    if (!savedHash) {
      toast.error("No PIN found. Please set a PIN first.")
      setPinExists(false)
      return
    }
    if (!isFourDigits(currentPin)) {
      toast.error("Enter your current 4-digit PIN")
      currentRef.current?.focus()
      return
    }
    if (!isFourDigits(newPin)) {
      toast.error("New PIN must be exactly 4 digits")
      newRef.current?.focus()
      return
    }

    const isMatch = await bcrypt.compare(currentPin, savedHash)
    if (!isMatch) {
      toast.error("Current PIN is incorrect ❌")
      setCurrentPin("")
      setTimeout(() => currentRef.current?.focus(), 50)
      return
    }

    const newHash = await bcrypt.hash(newPin, 10)
    localStorage.setItem("userPinHash", newHash)
    redirectWithToast("PIN reset successfully 🔑")
  }

  // while deciding mode, avoid layout jump
  if (pinExists === null) {
    return (
      <main className="min-h-screen flex items-center justify-center" />
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-lg shadow-xl p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-full border bg-primary/10">
            {pinExists ? (
              <RefreshCcw className="text-primary" size={24} strokeWidth={1.6} />
            ) : (
              <Sparkles className="text-yellow-500" size={24} strokeWidth={1.6} />
            )}
          </div>
          <h1 className="text-xl font-bold text-center">
            {pinExists ? "Reset Your PIN" : "Set Your PIN"}
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            {pinExists
              ? "Enter your current PIN and then choose a new one."
              : "Enter a 4-digit PIN to secure your account."}
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-6">
          {pinExists && (
            <div className="flex flex-col items-center gap-2">
              <label className="text-sm text-muted-foreground text-center w-full">
                Current PIN
              </label>
              <OTPInput
                id="current-pin"
                ref={currentRef}
                value={currentPin}
                onChange={setCurrentPin}
                containerClassName="flex items-center justify-center gap-3"
                maxLength={4}
                render={({ slots }) => (
                  <div className="flex gap-3">
                    {slots.map((slot, idx) => (
                      <Slot key={idx} {...slot} />
                    ))}
                  </div>
                )}
              />
            </div>
          )}

          <div className="flex flex-col items-center gap-2">
            <label className="text-sm text-muted-foreground text-center w-full">
              {pinExists ? "New PIN" : "PIN"}
            </label>
            <OTPInput
              id="new-pin"
              ref={newRef}
              value={newPin}
              onChange={setNewPin}
              containerClassName="flex items-center justify-center gap-3"
              maxLength={4}
              render={({ slots }) => (
                <div className="flex gap-3">
                  {slots.map((slot, idx) => (
                    <Slot key={idx} {...slot} />
                  ))}
                </div>
              )}
            />
          </div>

          <Button
            onClick={pinExists ? handleResetPin : handleSetPin}
            className="w-full"
          >
            {pinExists ? "Confirm Reset" : "Save PIN"}
          </Button>
        </div>
      </div>
    </main>
  )
}

/* OTP Slot (centered, nice focus state) */
function Slot(props: SlotProps) {
  return (
    <div
      className={cn(
        "flex size-12 items-center justify-center rounded-xl border font-semibold text-lg shadow-sm transition-all",
        "bg-white/80 dark:bg-zinc-800/80",
        {
          "border-primary ring-2 ring-primary/40": props.isActive,
          "text-gray-400": props.char === null,
        }
      )}
    >
      {props.char !== null && <div>{props.char}</div>}
    </div>
  )
}
