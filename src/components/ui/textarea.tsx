import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, id, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex min-h-19.5 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]  disabled:opacity-80",
        className
      )}
      id={id}
      {...props}
      spellCheck="false"
      autoCorrect="off"
      autoCapitalize="off"
      autoComplete="off"
    />
  )
}
Textarea.displayName = "Textarea"

export { Textarea }
