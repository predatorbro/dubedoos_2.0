'use client'
import {
  LogOutIcon,
  Lock,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession, signIn, signOut } from "next-auth/react"
import GoogleLogin from "./GoogleLogin"
import Link from "next/link"

export default function UserMenu() {
  const { data: session } = useSession()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
          {!session && <Avatar>
            <AvatarImage src="./avatar.jpg" alt="Profile image" />
            <AvatarFallback>GA</AvatarFallback>
          </Avatar>}
          {session?.user?.image && <Avatar>
            <AvatarImage src={session.user.image} alt="Profile image" />
            <AvatarFallback>{session.user.name?.charAt(0)}</AvatarFallback>
          </Avatar>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-w-64" align="end">
        <DropdownMenuLabel className="flex min-w-0 flex-col">
          <span className="text-foreground truncate text-sm font-medium">
            {session?.user?.name || "Guest Account"}
          </span>
          <span className="text-muted-foreground truncate text-xs font-normal">
            {session?.user?.email || "Not logged in"}
          </span>
        </DropdownMenuLabel>
        {session && <>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem >
              <Link href={"/pin-manager"} className="w-full h-full flex gap-3">
                <Lock size={16} className="opacity-60" aria-hidden="true" />
                {/* {localStorage.getItem("userPinHash") ? "Change PIN" : "Set PIN"} */}
                Change PIN
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
            <LogOutIcon size={16} className="opacity-60" aria-hidden="true" />
            <span>Logout</span>
          </DropdownMenuItem>
        </>}
        {
          !session && <GoogleLogin onClick={() => signIn('google')} />
        }
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
