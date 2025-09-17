'use client'
import { memo, useState } from "react"

import UserMenu from "@/components/user-menu"
import { Button } from "@/components/ui/button"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTriggerCustom,
  SelectValue,
} from "@/components/ui/select"

import {
  CirclePlus,
  Sparkles,
  Loader2,
  RotateCcw,
  Palette,
  ChevronDown,
  Trash2,
  NotebookPen,
  Info,
  InfoIcon,
  Calendar,
  Menu,
  Link,
  Trash,
  Key
} from "lucide-react"

import Toggler from "../UniversalToggler"
import { PopoverTrigger, Popover, PopoverContent } from "../ui/popover"
import { useDispatch } from "react-redux"
import { clearAllSections, createSection } from "@/store/features/notezSlice"
import { toast } from "sonner"
import { clearAllQuickees } from "@/store/features/quickySlice"
import { clearAllLinks } from "@/store/features/bookmarkSlice"
import useConfirmDialog from "../AlertComponent"
import { useTheme } from "next-themes"
import { clearAllCalendarTodos } from "@/store/features/calendarTodosSlice"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import * as PopoverPrimitive from "@radix-ui/react-popover"
import { InstructionsModal } from "@/components/myComponents/InstructionsModal"
import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
// Language options
const themeList = [
  { value: "light", label: "Summer" },
  { value: "dark", label: "Moon" },
  { value: "special", label: "Rainbow" },
]

export default function Component() {

  const [createNewSection, setCreateNewSection] = useState<boolean>(false)
  const [clearTodo, setClearTodo] = useState<boolean>(false)
  const [clearSection, setClearSection] = useState<boolean>(false)
  const [confirmationText, setConfirmationText] = useState<string>("");

  const dispatch = useDispatch()
  const { confirm, ConfirmDialog } = useConfirmDialog({ text: confirmationText })
  const { theme, setTheme } = useTheme();

  const [manualOpen, setManualOpen] = useState<boolean>(false)

  const handleCreateNewSection = () => {
    if (createNewSection) return;
    setCreateNewSection(true)
    setTimeout(() => {
      dispatch(createSection())
      setCreateNewSection(false)
      toast.success("New section created successfully!")
    }, 500);
    setTimeout(() => {
      const dashboard = document.getElementById("dashboard");
      dashboard!.scrollTo({
        top: dashboard!.scrollHeight,
        behavior: "smooth"
      });
    }, 600);
  }

  const handleClearTodo = async () => {
    setConfirmationText("Do you really want to clear all quickees?")
    const confirmation = await confirm()
    if (confirmation) {
      setClearTodo(true)
      setTimeout(() => {
        dispatch(clearAllQuickees())
        setClearTodo(false)
        toast.success("All quickees cleared successfully!")
      }, 1000);
    } else {
      setClearTodo(false)
    }
  }

  const handleClearSection = async () => {
    setConfirmationText("Do you really want to clear all sections?")
    const confirmation = await confirm()
    if (confirmation) {
      setClearSection(true)
      setTimeout(() => {
        dispatch(clearAllSections())
        setClearSection(false)
        toast.success("All sections cleared successfully!")
      }, 1000);
    } else {
      setClearSection(false)
    }
  }

  const handleClearCalendar = async () => {
    setConfirmationText("Do you really want to clear all calendars?")
    const confirmation = await confirm()
    if (confirmation) {
      dispatch(clearAllCalendarTodos())
      toast.success("All calendars cleared successfully!")
    }
  }

  const handleClearLinks = async () => {
    setConfirmationText("Do you really want to clear all links?")
    const confirmation = await confirm()
    if (confirmation) {
      dispatch(clearAllLinks())
      toast.success("All links cleared successfully!")
    }
  }


  const handleTheme = (value: string) => {
    if (value == "special") {
      toast.info("Rainbow theme is in development stage. Coming soon !!")
      setTheme(theme || "light")
    } else {
      setTheme(value)
    }
  }
  const pathname = usePathname();
  const router = useRouter();
  const isStreakCalendarPage = pathname === '/streak-calendar';
  const isPasswordManagerPage = pathname === '/passwordmanager';

  const handleStreakCalendar = () => {
    router.push('/streak-calendar');
  };

  const handlePasswordManager = () => {
    router.push('/passwordmanager');
  };

  const handleBackToWorkspace = () => {
    router.push('/workspace');
  };
  // Simulate Ctrl+B keyboard press to toggle sidebar
  const menuOnClick = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'b',
      ctrlKey: true,
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(event);
  }
  // Navigation links with icons for desktop icon-only navigation
  const navigationLinks = [
    { onClick: handleCreateNewSection, label: "Create Section", icon: CirclePlus, active: true },
    { onClick: handleClearTodo, label: "Reset Quickees", icon: RotateCcw },
    { onClick: handleClearSection, label: "Reset Sections", icon: Trash2 },
    { onClick: handleClearCalendar, label: "Reset Calendar", icon: Calendar },
    { onClick: handleClearLinks, label: "Reset bookmark", icon: Link },
    { onClick: handleStreakCalendar, label: "Streaks", icon: Calendar },
    { onClick: handlePasswordManager, label: "Password Manager", icon: Key },
    { onClick: () => setManualOpen(true), label: "Help", icon: InfoIcon },
  ]
  return (
    <header className="border rounded-md px-2 md:px-6">
      {ConfirmDialog}
      <InstructionsModal
        isOpen={manualOpen}
        onClose={() => setManualOpen(false)}
      />
      <div className="flex h-16 items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex flex-1 items-center gap-2">

          {/* Mobile menu trigger */}
          <Button
            className="group size-8 md:hidden"
            variant="ghost"
            size="icon"
            onClick={menuOnClick}
          >
            <Menu
              className="text-foreground"
            />
          </Button>
          <div className="flex items-center gap-6">
            <div
              className=" relative flex items-center gap-2 font-semibold text-xl text-primary/90 transition-colors duration-200"
            >
              <span>du-be-doos | 2.0</span>
              <PlayginStar />

            </div>

          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Back button for streak calendar */}
          {isStreakCalendarPage && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleBackToWorkspace}
                  className="flex items-center gap-2 hover:bg-accent"
                  variant="ghost"
                  size="sm"
                >
                  <ChevronDown size={16} className="rotate-90" />
                  <span className="hidden sm:inline">Back to Workspace</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="px-2 py-1 text-xs">
                <p>Return to main workspace</p>
              </TooltipContent>
            </Tooltip>
          )}
          {/* Back button for password manager */}
          {isPasswordManagerPage && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleBackToWorkspace}
                  className="flex items-center gap-2 hover:bg-accent"
                  variant="ghost"
                  size="sm"
                >
                  <ChevronDown size={16} className="rotate-90" />
                  <span className="hidden sm:inline">Back to Workspace</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="px-2 py-1 text-xs">
                <p>Return to main workspace</p>
              </TooltipContent>
            </Tooltip>
          )}
          {/* right navigation */}
          {!isStreakCalendarPage && !isPasswordManagerPage && (
            <NavigationMenu className="hidden sm:flex" >
              <NavigationMenuList className="gap-2" >
                <TooltipProvider >
                  <NavigationMenuItem key={"toggle items"} className="flex gap-3" >
                    {/* toggler for create section */}
                    <Tooltip open={createNewSection ? true : undefined} >
                      <TooltipTrigger asChild disabled={createNewSection}>
                        <NavigationMenuLink
                          className={`flex size-8 items-center justify-center p-1.5 ${createNewSection ? 'pointer-events-none' : ''}`}
                          onClick={!createNewSection ? handleCreateNewSection : undefined}
                        >
                          <Toggler
                            primaryIcon={
                              <Loader2
                                size={16}
                                className="animate-spin absolute shrink-0 scale-100 opacity-100 transition-all group-data-[state=on]:scale-0 group-data-[state=on]:opacity-0  text-green-500"
                                aria-hidden="true"
                              />
                            }
                            secondaryIcon={
                              <CirclePlus
                                size={16}
                                className="shrink-0 scale-0 opacity-0 transition-all group-data-[state=on]:scale-100 group-data-[state=on]:opacity-100"
                                aria-hidden="true"
                              />
                            }
                            state={createNewSection}
                            setState={setCreateNewSection}
                          />
                        </NavigationMenuLink>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        className="px-2 py-1 text-xs"
                      >
                        <p>{!createNewSection ? "Create New Section" : "Creating"}</p>
                      </TooltipContent>
                    </Tooltip>
                    {/* reset dropdown */}
                    <DropdownMenu>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                            <NavigationMenuLink className="flex size-8 items-center justify-center p-1.5">
                              <RotateCcw size={16} />
                            </NavigationMenuLink>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent
                          side="bottom"
                          className="px-2 py-1 text-xs"
                        >
                          <p>Reset Options</p>
                        </TooltipContent>
                      </Tooltip>
                      <DropdownMenuContent className="min-w-[140px]">
                        <DropdownMenuItem onClick={handleClearTodo} className="px-3 py-2">
                          Reset Quickees
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleClearSection} className="px-3 py-2">
                          Reset Sections
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleClearCalendar} className="px-3 py-2">
                          Reset Calendar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleClearLinks} className="px-3 py-2">
                          Reset bookmark
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {/* toggler for streak calendar */}
                    <Tooltip >
                      <TooltipTrigger asChild>
                        <NavigationMenuLink
                          className="flex size-8 items-center justify-center p-1.5"
                          onClick={handleStreakCalendar}
                        >
                          <Toggler
                            primaryIcon={
                              <Calendar
                                size={16}
                                className="absolute shrink-0 scale-100 opacity-100 transition-all group-data-[state=on]:scale-0 group-data-[state=on]:opacity-0 text-blue-500"
                                aria-hidden="true"
                              />
                            }
                            secondaryIcon={
                              <Calendar
                                size={16}
                                className="shrink-0 scale-0 opacity-0 transition-all group-data-[state=on]:scale-100 group-data-[state=on]:opacity-100 text-blue-500"
                                aria-hidden="true"
                              />
                            }
                            state={false}
                            setState={() => { }}
                          />
                        </NavigationMenuLink>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        className="px-2 py-1 text-xs"
                      >
                        <p>Streak Calendar</p>
                      </TooltipContent>
                    </Tooltip>
                    {/* toggler for password manager */}
                    <Tooltip >
                      <TooltipTrigger asChild>
                        <NavigationMenuLink
                          className="flex size-8 items-center justify-center p-1.5"
                          onClick={handlePasswordManager}
                        >
                          <Toggler
                            primaryIcon={
                              <Key
                                size={16}
                                className="absolute shrink-0 scale-100 opacity-100 transition-all group-data-[state=on]:scale-0 group-data-[state=on]:opacity-0 text-purple-500"
                                aria-hidden="true"
                              />
                            }
                            secondaryIcon={
                              <Key
                                size={16}
                                className="shrink-0 scale-0 opacity-0 transition-all group-data-[state=on]:scale-100 group-data-[state=on]:opacity-100 text-purple-500"
                                aria-hidden="true"
                              />
                            }
                            state={false}
                            setState={() => { }}
                          />
                        </NavigationMenuLink>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        className="px-2 py-1 text-xs"
                      >
                        <p>Password Manager</p>
                      </TooltipContent>
                    </Tooltip>
                    {/* toggler for manual */}
                    <Tooltip >
                      <TooltipTrigger asChild>
                        <NavigationMenuLink
                          className="flex size-8 items-center justify-center p-1.5"
                          onClick={() => setManualOpen(true)}
                        >
                          <Toggler
                            primaryIcon={
                              <InfoIcon
                                size={16}
                                className="absolute shrink-0 scale-100 opacity-100 transition-all group-data-[state=on]:scale-0 group-data-[state=on]:opacity-0  "
                                aria-hidden="true"
                              />
                            }
                            secondaryIcon={
                              <InfoIcon
                                size={16}
                                className="shrink-0 scale-0 opacity-0 transition-all group-data-[state=on]:scale-100 group-data-[state=on]:opacity-100"
                                aria-hidden="true"
                              />
                            }
                            state={manualOpen}
                            setState={setManualOpen}
                          />
                        </NavigationMenuLink>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        className="px-2 py-1 text-xs"
                      >
                        <p>Open Manual</p>
                      </TooltipContent>
                    </Tooltip>
                    {/* tooltips end */}
                  </NavigationMenuItem>
                </TooltipProvider>
              </NavigationMenuList>
            </NavigationMenu>
          )}

          {/* mobile navigation */}
          <Popover>
            <PopoverTrigger asChild className="sm:!hidden">
              <Button
                className="[&>svg]:text-muted-foreground/80 hover:bg-accent hover:text-accent-foreground 
                            h-8 border-none px-2 shadow-none [&>svg]:shrink-0 flex justify-center"
                variant="ghost"
                size="icon"
              >
                <ChevronDown size={16} aria-hidden="true" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-36 p-1 sm:hidden">
              <NavigationMenu className="max-w-none *:w-full">
                <NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
                  {navigationLinks.map((link, index) => {
                    const Icon = link.icon
                    return (
                      <NavigationMenuItem key={index} className="w-full" onClick={link.onClick}>
                        <PopoverPrimitive.PopoverClose asChild>
                          <NavigationMenuLink className="flex flex-row items-center gap-2 hover:bg-accent">
                            <Icon
                              size={16}
                              className="text-muted-foreground"
                              aria-hidden="true"
                            />
                            <span>{link.label}</span>
                          </NavigationMenuLink>
                        </PopoverPrimitive.PopoverClose>
                      </NavigationMenuItem>
                    )
                  })}
                </NavigationMenuList>
              </NavigationMenu>
            </PopoverContent>
          </Popover>


          {/* theme selector */}
          <Select defaultValue={theme} value={theme} onValueChange={(value) => handleTheme(value)} >
            <SelectTriggerCustom
              id={`theme`}
              className="[&>svg]:text-muted-foreground/80 hover:bg-accent hover:text-accent-foreground 
              h-8 border-none px-2 shadow-none [&>svg]:shrink-0 flex justify-center"
              aria-label="Select language"
            >
              <Palette size={16} aria-hidden="true" className="!hidden md:!block" />
              <span className="!hidden md:!inline-flex">
                <SelectValue />
              </span>
            </SelectTriggerCustom>
            <SelectContent>
              {themeList.map((theme) => (
                <SelectItem key={theme.value} value={theme.value}>
                  <span className="flex items-center gap-2">
                    <span className="truncate text-muted-foreground">{theme.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* User menu */}
          <span className="grid content-center mr-1.5">
            <UserMenu />
          </span>
        </div>
      </div>
    </header>
  )
}

const PlayginStar = memo(() => {
  return <motion.div
    initial={{ x: 0, y: -10, rotate: 0 }}
    animate={{
      x: [0, 10, -10, 5, -5, 0],
      y: [-10, -15, -5, -20, -10, -10],
      rotate: [0, 10, -10, 5, -5, 0]
    }}
    transition={{
      repeat: Infinity,
      duration: 4,
      ease: "easeInOut"
    }}
    className="absolute top-0 -right-2"
  >
    <Sparkles className="text-yellow-400" size={16} />
  </motion.div>
})
