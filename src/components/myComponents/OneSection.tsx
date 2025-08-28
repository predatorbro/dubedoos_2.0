import { useState } from "react";
import QuickInput from "../QuickInput";
import { ChevronDown, Grid2X2, Grid3X3, LayoutDashboard, Plus, Rows3, Trash2, } from "lucide-react";
import BigTodo from "./BigTodo";
import useConfirmDialog from "../AlertComponent";
import { addNote, deleteSection, editSectionTitle, Note } from "@/store/features/notezSlice";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { useLoader } from "../LoaderContext";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

import {
    PopoverTrigger,
    Popover,
    PopoverContent
} from "../ui/popover"

import { Button } from "../ui/button";

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList
} from "../ui/navigation-menu";
import * as PopoverPrimitive from "@radix-ui/react-popover"
export default function OneSection({ sectionData }: any) {
    const { sectionID, sectionTitle, sectionNotes } = sectionData

    const [titleState, setTitleState] = useState<string>(sectionTitle);
    const dispatch = useDispatch<AppDispatch>();

    const [confirmationText, setConfirmationText] = useState<string>("");
    const { confirm, ConfirmDialog } = useConfirmDialog({ text: confirmationText })
    const { showLoader, hideLoader } = useLoader()

    const handleDelete = async () => {
        setConfirmationText(`Do you want to delete ${sectionTitle || "this section"}?`)
        const result = await confirm()
        if (result) {
            dispatch(deleteSection(sectionID));
            showLoader({
                message: "Processing your request...",
                timeout: 1000,
                dismissible: false,
                onTimeout: () => toast.success('Section deleted successfully!')
            })
        }
    }

    const addNewNote = () => {
        dispatch(addNote(sectionID));
    }

    // const { sectionID, sectionTitle, sectionNotes } = sectionData
    const handleTitleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        dispatch(editSectionTitle({ title: titleState, sectionID }));
    }

    // grid layouts
    const [layoutMobile, setLayoutMobile] = useState<boolean>(false);
    const [showOptions, setShowOptions] = useState(false);
    const [layoutDesktop, setLayoutDesktop] = useState("md:grid-cols-2");

    const navigationLinks = [
        { id: `add-note-${sectionID}`, onClick: addNewNote, label: "Add new note", icon: Plus, active: true },
        { id: `toggle-layout-${sectionID}`, onClick: () => setLayoutMobile(!layoutMobile), label: "Change Layout", icon: LayoutDashboard },
        { id: `delete-section-${sectionID}`, onClick: handleDelete, label: "Delete Section", icon: Trash2 },
    ]

    const desktopOptions = [
        { id: `add-note-${sectionID}`, onClick: addNewNote, icon: Plus },
        { id: `layout-1col-${sectionID}`, onClick: () => setLayoutDesktop("md:grid-cols-1"), icon: Rows3 },
        { id: `layout-2col-${sectionID}`, onClick: () => setLayoutDesktop("md:grid-cols-2"), icon: Grid2X2 },
        { id: `layout-3col-${sectionID}`, onClick: () => setLayoutDesktop("xl:grid-cols-3"), icon: Grid3X3 },
        { id: `delete-section-${sectionID}`, onClick: handleDelete, icon: Trash2 },
    ];

    return (
        <div className="section-node border rounded-md w-full p-3 mb-5 border-gray-800 dark:border-gray-200/50" onDoubleClick={addNewNote}>
            {ConfirmDialog}
            <div className="flex gap-2 md:gap-0 pb-3 justify-between items-center" onDoubleClick={(e) => e.stopPropagation()}>
                {/* title */}
                <QuickInput
                    id={sectionID}
                    onBlur={handleTitleBlur}
                    value={titleState}
                    onChange={(e) => setTitleState(e.target.value)}
                    placeHolder="Section Title..."
                    className="text-ring font-semibold pr-0
                    text-2xl border-0 border-gray-800 dark:border-gray-200/50"
                    disabled
                />
                {/* popover dropdown for mobile*/}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            className="[&>svg]:text-muted-foreground/80 hover:bg-accent hover:text-accent-foreground 
                          md:hidden w-fit py-5 border-gray-800 dark:border-gray-200/50 shadow-none 
                        [&>svg]:shrink-0 flex justify-center aspect-square"
                            variant={"outline"}
                        >
                            <ChevronDown
                                size={16}
                                aria-hidden="true"
                                className="transition-transform duration-300"
                            />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-fit p-1 mr-6 md:hidden bg-muted">
                        <NavigationMenu className="max-w-none *:w-full">
                            <NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
                                {navigationLinks.map((link, index) => {
                                    const Icon = link.icon
                                    return (
                                        <NavigationMenuItem id={link.id} key={link.id} className="w-full" onClick={link.onClick}>
                                            <PopoverPrimitive.PopoverClose asChild>
                                                <NavigationMenuLink className="flex flex-row items-center gap-2  hover:bg-neutral-400/60">
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
                {/* popover for desktop */}
                <div className={`hidden md:flex items-center justify-end gap-2 relative `}
                    style={{ width: showOptions ? (desktopOptions.length + 1) * 60 : 60 }}
                >
                    {/* Main Button */}
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowOptions(!showOptions)}
                        className="open-section-navigation w-12 h-12 flex justify-center items-center relative z-10 border-gray-800 dark:border-gray-200/50"
                    >
                        <motion.div
                            animate={{ rotate: showOptions ? 90 : 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ChevronDown size={20} />
                        </motion.div>
                    </Button>

                    {/* Animated Options */}
                    <AnimatePresence>
                        {showOptions && (
                            <motion.div
                                className="section-navigation absolute right-14 flex gap-2 ml-2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ staggerChildren: 0.1 }}
                            >
                                {desktopOptions.map((opt, i) => (
                                    <motion.div
                                        key={opt.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Button id={opt.id} variant="outline" className="aspect-square h-full" onClick={opt.onClick}>
                                            <opt.icon className="" />
                                        </Button>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>

            {/* Animated notes container with AnimatePresence */}
            <div className={`notes-render-area rounded-md h-fit grid gap-3 ${layoutMobile ? "grid-cols-2 sm:grid-cols-1" : "grid-cols-1 sm:grid-cols-2"} ${layoutDesktop} `}>
                <AnimatePresence mode="popLayout">
                    {/* Pinned notes */}
                    {sectionNotes
                        .filter((note: Note) => note.pinned)
                        .map((note: Note, index: number) => (
                            <motion.div
                                key={note.id}
                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                                transition={{
                                    duration: 0.3,
                                    delay: index * 0.05,
                                    ease: "easeOut"
                                }}
                                layout
                            >
                                <BigTodo noteData={note} sectionID={sectionID} />
                            </motion.div>
                        ))}
                </AnimatePresence>

                <AnimatePresence mode="popLayout">
                    {/* Regular notes */}
                    {sectionNotes
                        .filter((note: Note) => !note.pinned)
                        .map((note: Note, index: number) => (
                            <motion.div
                                key={note.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                                transition={{
                                    duration: 0.3,
                                    delay: index * 0.03,
                                    ease: "easeOut"
                                }}
                                layout
                            >
                                <BigTodo noteData={note} sectionID={sectionID} />
                            </motion.div>
                        ))}
                </AnimatePresence>
            </div>
        </div >
    )
}