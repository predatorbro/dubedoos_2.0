import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "./ui/input"
import axios from "axios"
import { toast } from "sonner";
import { LoaderOne } from "@/components/ui/loader";

interface quickeeProps {
  value: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  id: string
  magicTodoLoading: boolean
  onDoubleClick?: any
}

export default function DisplayQuickee({ value, checked, onCheckedChange, id, magicTodoLoading, onDoubleClick }: quickeeProps) {

  return (
    <div className="flex items-center gap-2 w-full pl-1 select-none">
      <Checkbox
        style={
          {
            "--primary": "var(--color-emerald-500)",
          } as React.CSSProperties
        }
        id={id}
        className="rounded-full h-5 w-5"
        checked={checked}
        onCheckedChange={onCheckedChange}
        onDoubleClick={(e) => e.stopPropagation()}
      />
      <div
        className="relative w-full"
        onDoubleClick={onDoubleClick}
      >
        {magicTodoLoading ? (
          <div className="w-full flex justify-center scale-50">
            <LoaderOne />
          </div>
        ) : (
          <Input
            id={id}
            className={`shadow-none outline-none border-none text-primary/80 bg-transparent text-sm w-full ${checked ? 'line-through opacity-60' : ''}`}
            disabled
            value={value}
          />
        )}
      </div>
    </div>
  )
}
