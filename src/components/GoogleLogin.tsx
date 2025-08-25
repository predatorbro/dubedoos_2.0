import {
  RiGoogleFill,
} from "@remixicon/react"

import { Button } from "@/components/ui/button"

export default function GoogleLogin({ onClick }: { onClick?: () => void }) {

  return (
    <div className="flex flex-col gap-2">
      <Button variant="outline" onClick={onClick}>
        <RiGoogleFill
          className="me-1 text-[#DB4437] dark:text-white/60"
          size={16}
          aria-hidden="true"
        />
        Login with Google
      </Button>
    </div>
  )
}
