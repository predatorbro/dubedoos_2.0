import { Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function HoverToolTipButton({ onClick }: { onClick?: (e: any) => void }) {
  return (
    <TooltipProvider delayDuration={0} >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onMouseDown={(e) => e.preventDefault()} onClick={onClick} variant="outline" size="icon" aria-label="Add new item" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer">
            <Trash size={8} aria-hidden="true" color="#EF4444" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="px-1 py-0.5 text-xs text-red-500">Delete</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
