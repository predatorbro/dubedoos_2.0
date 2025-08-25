"use client"

import { useEffect, useRef, useState } from "react"
import { OTPInput, SlotProps } from "input-otp"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Sparkles } from "lucide-react"
import bcrypt from "bcryptjs"

async function isPasswordCorrect(pass: string) {
  const savedHash = localStorage.getItem("userPinHash")
  const isMatch = await bcrypt.compare(pass, savedHash!)
  return isMatch
}

interface props {
  defOpen: boolean
  onOpenChange: (open: boolean) => void
  setPasswordCorrect: (passwordCorrect: boolean) => void
}

export default function PasswordDialog({ defOpen, onOpenChange, setPasswordCorrect }: props) {
  const [value, setValue] = useState("")
  const [hasGuessed, setHasGuessed] = useState<undefined | boolean>(undefined)
  const inputRef = useRef<HTMLInputElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (hasGuessed) {
      closeButtonRef.current?.focus()
    }
  }, [hasGuessed])

  async function onSubmit(e?: React.FormEvent<HTMLFormElement>) {
    e?.preventDefault?.()

    inputRef.current?.select()
    await new Promise((r) => setTimeout(r, 1_00))

    onOpenChange(!(await isPasswordCorrect(value)))
    setPasswordCorrect(await isPasswordCorrect(value))

    setValue("")
    setTimeout(() => {
      inputRef.current?.focus()
    }, 20)
  }
  const [open, setOpen] = useState(defOpen);
  return (
    <Dialog open={open} onOpenChange={() => onOpenChange(!open)}>
      <DialogContent>
        <div className="flex flex-col items-center gap-5">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <Sparkles className="text-yellow-400" size={20} strokeWidth={1.5} />
          </div>
          <DialogHeader>
            <DialogTitle className="sm:text-center">
              Password Confirmation
            </DialogTitle>
            <DialogDescription className="sm:text-center">
              Enter your 4-digit password to continue.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center">
            <OTPInput
              id="cofirmation-code"
              ref={inputRef}
              value={value}
              onChange={setValue}
              containerClassName="flex items-center gap-3 has-disabled:opacity-50"
              maxLength={4}
              onFocus={() => setHasGuessed(undefined)}
              render={({ slots }) => (
                <div className="flex gap-2">
                  {slots.map((slot, idx) => (
                    <Slot key={idx} {...slot} />
                  ))}
                </div>
              )}
              onComplete={onSubmit}
            />
          </div>

          <p className="text-center text-sm cursor-pointer">
            Reset Password
          </p>
        </div>

      </DialogContent>
    </Dialog >
  )
}

function Slot(props: SlotProps) {
  return (
    <div
      className={cn(
        "border-input bg-background text-foreground flex size-9 items-center justify-center rounded-md border font-medium shadow-xs transition-[color,box-shadow]",
        { "border-ring ring-ring/50 z-10 ring-[3px]": props.isActive }
      )}
    >
      {props.char !== null && <div>{props.char}</div>}
    </div>
  )
}
