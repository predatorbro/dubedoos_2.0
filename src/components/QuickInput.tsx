"use client"
import React, { useRef, useState } from "react"
import { CircleXIcon } from "lucide-react"
import { Input } from "@/components/ui/input"

interface QuickInputProps {
  className?: string
  placeHolder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => (void);
  disabled: boolean
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => (void);
  id: string;
}

function QuickInput({ className, placeHolder, value, onChange, disabled, onBlur, id }: QuickInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClearInput = () => {
    if (inputRef.current) {
      inputRef.current.value = ""
      inputRef.current.focus()
      onChange({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>)
    }
  }
  const [showX, setShowX] = useState(false)
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setShowX(false)
    onBlur?.(e)
  }
  return (
    <div className="*:not-first:mt-2 flex-1">
      <div className="relative">
        <Input
          id={id}
          ref={inputRef}
          className={`p-2 ${showX && "pe-9"} ${className} text-muted-foreground shadow-none`}
          placeholder={placeHolder || "Type something..."}
          type="text"
          value={value}
          onChange={onChange}
          disabled={!disabled}
          onBlur={handleBlur}
          onFocus={() => setShowX(true)}
          spellCheck={false}
          autoCorrect={"off"}
          autoComplete={"off"}
        />
        {showX && (value && (disabled == true &&
          <button
            type="button"
            className="text-muted-foreground/80 hover:text-ring focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Clear input"
            onClick={handleClearInput}
            onMouseDown={(e) => e.preventDefault()}
          >
            <CircleXIcon size={16} aria-hidden="true" />
          </button>)
        )}
      </div>
    </div>
  )
}

export default React.memo(QuickInput)