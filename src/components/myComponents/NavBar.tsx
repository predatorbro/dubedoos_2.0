'use client'
import { useState } from "react"

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
  InfoIcon
} from "lucide-react"

import Toggler from "../UniversalToggler"
import { PopoverTrigger, Popover, PopoverContent } from "../ui/popover"
import { useDispatch } from "react-redux"
import { clearAllSections, createSection } from "@/store/features/notezSlice"
import { toast } from "sonner"
import { clearAllQuickees } from "@/store/features/quickySlice"
import useConfirmDialog from "../AlertComponent"
import { useTheme } from "next-themes"

import * as PopoverPrimitive from "@radix-ui/react-popover"
import { InstructionsModal } from "@/components/myComponents/InstructionsModal"
import { motion } from 'framer-motion';
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


  const handleTheme = (value: string) => {
    if (value == "special") {
      toast.info("Rainbow theme is in development stage. Coming soon !!")
      setTheme(theme || "light")
    } else {
      setTheme(value)
    }
  }
  // Navigation links with icons for desktop icon-only navigation
  const navigationLinks = [
    { onClick: handleCreateNewSection, label: "Section", icon: CirclePlus, active: true },
    { onClick: handleClearTodo, label: "Quickees", icon: RotateCcw },
    { onClick: handleClearSection, label: "Sections", icon: Trash2 },
    { onClick: () => setManualOpen(true), label: "Help", icon: InfoIcon },
  ]
  return (
    <header className="border rounded-md px-4 md:px-6 border-gray-800 dark:border-gray-200/50">
      {ConfirmDialog}
      <InstructionsModal
        isOpen={manualOpen}
        onClose={() => setManualOpen(false)}
      />
      <div className="flex h-16 items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex flex-1 items-center gap-3">
          {/* Mobile menu trigger */}
          <Button
            className="group size-8 md:hidden pointer-events-none"
            variant="ghost"
            size="icon"
            disabled
          >
          </Button>
          <div className="flex items-center gap-6">

            <div
              className=" relative flex items-center gap-2 font-semibold text-xl text-primary/90 transition-colors duration-200"
            >
              <span>du-be-doos | 2.0</span>
              <motion.div
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

            </div>

          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">

          {/* right navigation */}
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
                  {/* toggler for clear todos */}
                  <Tooltip open={clearTodo ? true : undefined}>
                    <TooltipTrigger asChild>
                      <NavigationMenuLink
                        className="flex size-8 items-center justify-center p-1.5"
                        onClick={handleClearTodo}
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
                            <NotebookPen
                              size={16}
                              className="shrink-0 scale-0 opacity-0 transition-all group-data-[state=on]:scale-100 group-data-[state=on]:opacity-100"
                              aria-hidden="true"
                            />
                          }
                          state={clearTodo}
                          setState={setClearTodo}
                        />
                      </NavigationMenuLink>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="px-2 py-1 text-xs"
                    >
                      <p>{!createNewSection ? "Reset Quickees" : "Resetting"}</p>
                    </TooltipContent>
                  </Tooltip>
                  {/* toggler for clear sections */}
                  <Tooltip open={clearSection ? true : undefined}>
                    <TooltipTrigger asChild>
                      <NavigationMenuLink
                        className="flex size-8 items-center justify-center p-1.5"
                        onClick={handleClearSection}
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
                            <RotateCcw
                              size={16}
                              className="shrink-0 scale-0 opacity-0 transition-all group-data-[state=on]:scale-100 group-data-[state=on]:opacity-100"
                              aria-hidden="true"
                            />
                          }
                          state={clearSection}
                          setState={setClearSection}
                        />
                      </NavigationMenuLink>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="px-2 py-1 text-xs"
                    >
                      <p>{!createNewSection ? "Reset Sections" : "Resetting"}</p>
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
            <PopoverContent align="start" className="w-36 p-1 sm:hidden bg-muted">
              <NavigationMenu className="max-w-none *:w-full">
                <NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
                  {navigationLinks.map((link, index) => {
                    const Icon = link.icon
                    return (
                      <NavigationMenuItem key={index} className="w-full" onClick={link.onClick}>
                        <PopoverPrimitive.PopoverClose asChild>
                          <NavigationMenuLink className="flex flex-row items-center gap-2 hover:bg-neutral-400/60">
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
              id={`language-${Math.random().toString(36).substring(2, 15)}`}
              className="[&>svg]:text-muted-foreground/80 hover:bg-accent hover:text-accent-foreground 
              h-8 border-none px-2 shadow-none [&>svg]:shrink-0 flex justify-center"
              aria-label="Select language"
            >
              <Palette size={16} aria-hidden="true" className="!hidden md:!block" />
              <span className="!hidden md:!inline-flex">
                <SelectValue />
              </span>
            </SelectTriggerCustom>
            <SelectContent className="bg-muted [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2">
              {themeList.map((theme) => (
                <SelectItem key={theme.value} value={theme.value} className="data-[highlighted]:bg-neutral-400/60 w-full h-full overflow-hidden">
                  <span className="flex items-center gap-2 ">
                    <span className="truncate text-muted-foreground">{theme.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* User menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
