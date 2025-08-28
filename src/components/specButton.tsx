import { Button } from "@/components/ui/button"
import React from "react"
interface SpecButtonProps {
  children?: React.ReactNode
  className?: string
  text?: string
  onClick?: () => void
  id: string
}

function SpecButton({ children, className, text = "", onClick, id }: SpecButtonProps) {
  return (
    <Button variant={"outline"}
      id={id}
      className={`${className} 
      bg-transparent 
      dark:text-gray-200/50 `} onClick={onClick}>
      {children}
      {text && text}
    </Button>
  )
}

export default React.memo(SpecButton)

