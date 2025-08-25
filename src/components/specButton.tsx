import { Button } from "@/components/ui/button"
import React from "react"
interface SpecButtonProps {
  children?: React.ReactNode
  className?: string
  text?: string
  onClick?: () => void
}

function SpecButton({ children, className, text = "", onClick }: SpecButtonProps) {
  return (
    <Button variant={"outline"}
      className={`${className} 
      bg-transparent 
      dark:text-gray-200/50 `} onClick={onClick}>
      {children}
      {text && text}
    </Button>
  )
}

export default React.memo(SpecButton)

