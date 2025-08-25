import React from "react"
import { SparklesIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"

const BadgeButton = ({ children }: { children: string }) => {
  return (
    <Badge
      variant="outline"
      className="mb-3 cursor-pointer rounded-4xl border border-black/10 bg-muted tracking-wide text-base px-4 py-2  md:left-6"
    >
      <SparklesIcon size={20} className=" mr-2 fill-[#EEBDE0] stroke-1 text-neutral-800" />{" "}
      {children}
    </Badge>
  )
}

export default BadgeButton
