"use client"
import HoverToolTipButton from '../HoverToolTipButton'
import { useEffect, useRef, useState } from 'react'
import { deleteNote, editNote, Note, setDeadLine, saveImages, togglePin, toggleVisibility, deleteImage } from '@/store/features/notezSlice'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/store/store'
import { toast } from "sonner"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import Toggler from '../UniversalToggler'
import { CalendarIcon, Copy, CopyCheck, Eye, EyeOffIcon, Loader2, Paperclip, Pencil, Pin, PinOff, Save, Sparkle, Sparkles, Trash, WandSparkles, X } from 'lucide-react'
import useConfirmDialog from '../AlertComponent'

import { useSession } from "next-auth/react"

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu"

import axios, { AxiosResponse } from 'axios'
import ImageUploader from '../ImageUploader'
import { Button } from '../ui/button'
import { motion, AnimatePresence } from "framer-motion"
import { Calendar } from "@/components/ui/calendar"


import TimeDisplay from './TimeDisplay'

import QuickInput from '../QuickInput'
import AutoGrowTextarea from '../TextAreaGrowing'
import { FullScreenCarousel } from '../ui/card-carousel'
import Image from 'next/image'
import Heartbeatdiv from './Heartbeatdiv'
import PasswordDialog from '../PasswordDialog'
import { useRouter } from 'next/navigation'
import { CloudinaryImage } from '@/lib/cloudinary'


function BigTodo({ noteData, sectionID }: any) {

    const { id, noteTitle, note, date, pinned, visibility, deadLine, images } = noteData as Note

    const { data: session, status } = useSession()

    if (status === 'loading') {
        return <div>Loading...</div>
    }

    const dispatch = useDispatch<AppDispatch>()

    const { confirm, ConfirmDialog } = useConfirmDialog({ text: "Do you really want to delete this item?" })

    // Example handlers

    const [title, setTitle] = useState(noteTitle)

    const [content, setContent] = useState(note);

    const [isEditing, setIsEditing] = useState(false);
    const [noteState, setNoteState] = useState<boolean>(true)
    const [pinnedStatus, setPinnedStatus] = useState<boolean>(pinned)
    const [copyStatus, setCopyStatus] = useState<boolean>(false)

    const [visible, setVisibility] = useState<boolean>(visibility)

    const [magicTitleLoading, setMagicTitleLoading] = useState<boolean>(false)
    const [magicDescriptionLoading, setMagicDescriptionLoading] = useState<boolean>(false)

    const [showUploader, setShowUploader] = useState<boolean>(false);
    const [showCarousel, setShowCarousel] = useState<boolean>(false)

    const [updateNote, setUpdateNote] = useState<boolean>(false)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    // calander states of note

    const [calendarDate, setCalendarDate] = useState<Date | undefined>(deadLine ? new Date(Number(deadLine)) : undefined)
    const [calanderOpen, setCalanderOpen] = useState(false)

    // password state
    const [passwordCorrect, setPasswordCorrect] = useState<boolean>(false)
    const [showPasswordDialog, setshowPasswordDialog] = useState(false)


    const today = new Date()
    useEffect(() => {
        if (updateNote) {
            const payload = { id, title, content, sectionID };
            dispatch(editNote(payload));
            setUpdateNote(false);
        }
    }, [updateNote])

    const handleEditToggle = () => {

        if (isEditing) {
            setUpdateNote(true)
            setIsEditing(false)
        }
        else {
            setIsEditing(true)
        }

    };
    const handlePinToggle = () => {
        const payload = { id, sectionID };
        dispatch(togglePin(payload));
    }
    // visibility
    useEffect(() => {
        if (!visible) {
            if (passwordCorrect) {
                setVisibility(true)
                const payload = { id, sectionID, status: true };
                dispatch(toggleVisibility(payload));
                setPasswordCorrect(false)
            }
        }
    }, [passwordCorrect])
    const router = useRouter()
    const handleVisibilityToggle = () => {
        const hasPin = localStorage.getItem("userPinHash") !== null;
        if (!session) {
            toast.warning('Please login..', {
                description: 'You need to login to use this feature.',
                action: (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => router.push("/login")}
                    >
                        Login
                    </Button>
                ),
            })
            setVisibility(true);
            return;
        }
        if (!hasPin) {
            toast.warning('Please set a PIN', {
                description: 'You need to set a PIN to use this feature.',
                action: (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => router.push("/pin-manager")}
                    >
                        Set PIN
                    </Button>
                ),
            })
            setVisibility(true);
            return;
        }
        if (visible) {
            setVisibility(false)
            const payload = { id, sectionID, status: false };
            dispatch(toggleVisibility(payload));
        }
        else {
            setshowPasswordDialog(true)

            if (passwordCorrect) {
                setVisibility(true)
            } else {
                setVisibility(false)
            }
        }
    }

    useEffect(() => {
        if (copyStatus) {
            setTimeout(() => {
                setCopyStatus(false)
            }, 1500);
        }
    }, [copyStatus])
    const handleDelete = async () => {
        const ok = await confirm()
        if (ok) {
            dispatch(deleteNote({ id, sectionID }));
        }
    };

    const handleCopyEvent = () => {
        navigator.clipboard.writeText(`${noteTitle}\n\n${note}`);
    }
    const handleMagicTitle = () => {
        setMagicTitleLoading(true)
        let words: string[] = [];
        if (!title) {
            toast.error("Please write something to generate magic title!");
            setMagicTitleLoading(false);
            return null;
        }
        axios.post('/api/chat', { message: title }).then((response) => {
            const text = response.data.text;
            words = text.split(" ");

            let current = "";
            words.forEach((word: string, i: number) => {
                setTimeout(() => {
                    current += (current ? " " : "") + word;
                    setTitle(current);
                }, i * 100);
            });

            setTimeout(() => {
                setUpdateNote(true);
                toast.success("Changes saved successfully!");
            }, words.length * 100 + 500);

        }).catch((error) => {
            setTimeout(() => {
                toast.error("Error : " + error.response.data.error);
            }, 1000);
        }).finally(() => {
            setMagicTitleLoading(false);
        });
    }

    const handleMagicNote = () => {
        setMagicDescriptionLoading(true);
        let words: string[] = [];
        if (!content) {
            toast.error("Please write something to generate magic notes!");
            setMagicDescriptionLoading(false);
            return null;
        }
        axios.post('/api/chat', { message: content }).then((response) => {
            const text = response.data.text;
            words = text.split(" ");

            let current = "";
            words.forEach((word: string, i: number) => {
                setTimeout(() => {
                    current += (current ? " " : "") + word;
                    setContent(current);
                }, i * 100);
            });

            setTimeout(() => {
                setUpdateNote(true);
                toast.success("Changes saved successfully!");
            }, words.length * 100 + 500);

        }).catch((error) => {
            toast.error("Error : " + error.response.data.error);
        }).finally(() => {
            setMagicDescriptionLoading(false);
        });
    }

    useEffect(() => {
        document.body.classList.toggle("overflow-hidden", showUploader);
    }, [showUploader]);

    useEffect(() => {
        document.body.classList.toggle("overflow-hidden", showCarousel);
    }, [showCarousel]);

    const handleAttachment = async (secondaryClick: boolean) => {
        if (!secondaryClick) {
            if (!session) {
                toast.warning('Please login..', {
                    description: 'You need to login to use this feature.',
                    action: (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => router.push("/login")}
                        >
                            Login
                        </Button>
                    ),
                })
                return;
            }
            setShowUploader(true);
            return;
        }

        if (selectedFiles.length < 1) {
            toast.error("No files selected for upload.");
            return;
        }

        setShowUploader(false);

        // Create upload function
        const uploadFiles = async () => {
            const formData = new FormData();
            Array.from(selectedFiles).forEach((file) => {
                formData.append("files", file);
            });

            const response = await axios.post("/api/upload", formData);
            return response.data;
        };

        // Use toast.promise with correct return types
        toast.promise(uploadFiles(), {
            loading: `Uploading ${selectedFiles.length} images...`,
            success: (data) => {
                if (data.success) {
                    dispatch(saveImages({
                        id,
                        sectionID,
                        images: data.results
                    }));
                    return `${selectedFiles.length} files uploaded successfully!`;
                } else {
                    throw new Error(data.error);
                }
            },
            error: (error) => {
                console.log("Upload error:", error);
                return `Error while uploading images!`;
            },
            finally: () => {
                setSelectedFiles([]);
            },
        });
    };

    const handleDeleteImage = async (public_id: string) => {

        try {
            const response = await axios.post("/api/deleteimage", {
                public_id,
            });
            if (response.status === 200) {
                toast.success("Image deleted successfully!");
                dispatch(deleteImage({
                    id,
                    sectionID,
                    public_id
                }));
            } else {
                toast.error(response.data.error || "Failed to delete image!");
            }
        } catch (error) {
            console.log("Error deleting image:", error);
            toast.error("Error deleting image");
        }
    };


    useEffect(() => {
        if (calanderOpen == false) {
            dispatch(setDeadLine({
                id,
                sectionID,
                deadLine: calendarDate ? calendarDate.getTime().toString() : undefined
            }));
        }
    }, [calanderOpen])

    const [borderColor, setBorderColor] = useState("border-gray-800 dark:border-gray-200/50")

    function checkDeadline(deadLine: string | number | undefined): void {
        // Handle undefined deadline
        if (!deadLine) {
            return;
        }

        // Convert to numbers if they're strings
        const deadlineTime = typeof deadLine === 'string' ? parseInt(deadLine) : deadLine;

        // Convert to Date objects
        const deadlineDate = new Date(deadlineTime);
        const currentDate = new Date();

        // Calculate difference in days
        const timeDiff = deadlineDate.getTime() - currentDate.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        // Check if exactly one day left
        if (daysDiff === 1) {
            setBorderColor('border-yellow-600')
        } else if (daysDiff === 0) {
            setBorderColor('border-red-500')
        } else if (daysDiff < 0) {
            toast.error("Deadline has passed for " + title);
            setBorderColor('border-blue-500')
        } else {
            setBorderColor('border-gray-800 dark:border-gray-200/50')
        }
    }

    useEffect(() => {
        if (deadLine) {
            checkDeadline(deadLine)
        } else {
            setBorderColor('border-gray-800 dark:border-gray-200/50')
        }
    }, [deadLine])
    // words and chars counter
    function countWordsAndChars(text: string | null | undefined): { words: number; characters: number } {
        if (!text || typeof text !== 'string') {
            return { words: 0, characters: 0 };
        }

        const trimmed = text.trim();
        if (trimmed === '') {
            return { words: 0, characters: 0 };
        }

        const words = trimmed.split(/\s+/).filter(word => word.length > 0).length;
        const characters = text.length;

        return { words, characters };
    }


    const animate: any = (borderColor.includes("red") ? true : false)
    // the return body is here
    const body = <div
        key={id}
        className={`border p-3 rounded-md h-fit shrink relative  ${!isEditing && borderColor}`}
        onDoubleClick={(e) => e.stopPropagation()}
    >
        {/* calander for deadline */}
        <div className='absolute -top-[375px] right-[30%]'>
            <AnimatePresence>
                {calanderOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.25 }}
                        className="z-50 rounded-xl border  bg-accent p-2 shadow-lg"
                    >
                        <Calendar
                            mode="single"
                            selected={calendarDate}
                            onSelect={(d) => {
                                setCalendarDate(d)
                                setCalanderOpen(!calanderOpen) // Close after selecting
                            }}
                            className="rounded-md p-2 bg-transparent "
                            classNames={{
                                day_button:
                                    "rounded-full hover:bg-border hover:text-white focus:bg-primary  ",
                                day_today: "border border-primary rounded-full",
                                today: "rounded-full ",
                                day_selected: "rounded-full",
                                selected: "!bg-primary !text-primary-foreground  rounded-full hover:!bg-primary hover:!text-background ",
                            }}
                            disabled={{ before: today }} // 1️⃣ Disable past days
                        />
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 z-40">
                            <div
                                className="size-10 bg-accent"
                                style={{
                                    clipPath: 'polygon(0% 0%, 100% 0%, 0% 100%)'
                                }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
        {/* carousel component */}
        {showCarousel && <FullScreenCarousel
            images={images as CloudinaryImage[]}
            onClose={() => setShowCarousel(false)}
            autoplayDelay={2000}
            showPagination={false}
            showNavigation={false}
        />}
        {/* confirmation dialog */}
        {ConfirmDialog}
        {/* uploader component */}
        {
            showUploader && session && <div className='fixed overflow-hidden inset-0 z-50 h-screen  flex items-center justify-center bg-black/90 text-gray-50'>
                <AnimatePresence>
                    {showUploader && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed overflow-hidden inset-0 z-50 h-screen flex items-center justify-center bg-background/70 text-gray-50"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
                                transition={{
                                    duration: 0.4,
                                    type: "spring",
                                    damping: 15,
                                    stiffness: 200
                                }}
                                className="size-96 relative"
                            >

                                <X
                                    className="absolute -top-7 -right-7 hover:cursor-pointer text-white border rounded-full p-2 size-8"
                                    onClick={() => setShowUploader(false)}
                                />

                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <ImageUploader onFilesChange={(files) => setSelectedFiles(files)} />
                                </motion.div>

                                <motion.div
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex justify-between mt-3 px-15"
                                >
                                    <Button variant="secondary" onClick={() => setShowUploader(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={() => handleAttachment(true)}>
                                        Confirm
                                    </Button>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        }
        {/* password confirmation dialog */}
        {
            showPasswordDialog &&
            <AnimatePresence>
                {showPasswordDialog && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 30 }}
                            transition={{
                                duration: 0.35,
                                type: "spring",
                                damping: 20,
                                stiffness: 220,
                            }}
                            className="relative w-96"
                        >
                            <PasswordDialog
                                defOpen={showPasswordDialog}
                                onOpenChange={setshowPasswordDialog}
                                setPasswordCorrect={setPasswordCorrect}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        }
        {/* all tool tips */}
        <NavigationMenu className="scale-90 md:scale-100 flex w-full">
            <NavigationMenuList className="">
                <TooltipProvider>

                    <NavigationMenuItem key={"toggle visibility"} className="flex">
                        {/* visibility toggle */}
                        <Tooltip >
                            <TooltipTrigger asChild>
                                <NavigationMenuLink
                                    className="flex size-8 items-center justify-center p-1.5"
                                    onClick={handleVisibilityToggle}
                                >
                                    <Toggler
                                        primaryIcon={
                                            <Eye
                                                size={16}
                                                className="absolute shrink-0 scale-100 opacity-100 transition-all group-data-[state=on]:scale-0 group-data-[state=on]:opacity-0"
                                                aria-hidden="true"
                                            />
                                        }
                                        secondaryIcon={
                                            <EyeOffIcon
                                                size={16}
                                                className="shrink-0 scale-0 opacity-0 transition-all group-data-[state=on]:scale-100 group-data-[state=on]:opacity-100"
                                                aria-hidden="true"
                                            />
                                        }
                                        state={visible}
                                        setState={setVisibility}
                                    />
                                </NavigationMenuLink>
                            </TooltipTrigger>
                            <TooltipContent
                                side="bottom"
                                className="px-2 py-1 text-xs"
                            >
                                <p>{visible ? "Hide" : "Show"}</p>
                            </TooltipContent>
                        </Tooltip>
                    </NavigationMenuItem >

                    {visible &&
                        <NavigationMenuItem key={"toggle items"} className="flex">
                            {/* toggler for edit and save */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <NavigationMenuLink
                                        className="flex size-8 items-center justify-center p-1.5"
                                        onClick={handleEditToggle}
                                    >
                                        <Toggler
                                            primaryIcon={
                                                <Pencil
                                                    size={16}
                                                    className="absolute shrink-0 scale-100 opacity-100 transition-all group-data-[state=on]:scale-0 group-data-[state=on]:opacity-0"
                                                    aria-hidden="true"
                                                />
                                            }
                                            secondaryIcon={
                                                <Save
                                                    size={16}
                                                    className="shrink-0 scale-0 opacity-0 transition-all group-data-[state=on]:scale-100 group-data-[state=on]:opacity-100 text-green-500"
                                                    aria-hidden="true"
                                                />
                                            }
                                            state={noteState}
                                            setState={setNoteState}
                                        />
                                    </NavigationMenuLink>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="bottom"
                                    className="px-2 py-1 text-xs"
                                >
                                    <p>{noteState ? "Edit" : "Save"}</p>
                                </TooltipContent>
                            </Tooltip>
                            {/* attachment files images */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <NavigationMenuLink
                                        className="flex size-8 items-center justify-center p-1.5"
                                        onClick={() => handleAttachment(false)}
                                    >
                                        <Paperclip size={20} aria-hidden="true" />
                                        <span className="sr-only">Add images</span>
                                    </NavigationMenuLink>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="bottom"
                                    className="px-2 py-1 text-xs"

                                >
                                    <p>Add images</p>
                                </TooltipContent>
                            </Tooltip>
                            {/* calander dead line */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <NavigationMenuLink
                                        className="flex size-8 items-center justify-center p-1.5"
                                        onClick={() => setCalanderOpen(!calanderOpen)}
                                    >
                                        <CalendarIcon size={20} aria-hidden="true" />
                                        <span className="sr-only">Dead line</span>
                                    </NavigationMenuLink>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="bottom"
                                    className="px-2 py-1 text-xs"
                                >
                                    {calendarDate ? `Dead line: ${calendarDate.toDateString()}` : "Set dead line"}
                                </TooltipContent>
                            </Tooltip>

                            {/* toggler for pin and unpin */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <NavigationMenuLink
                                        className="flex size-8 items-center justify-center p-1.5"
                                        onClick={handlePinToggle}
                                    >
                                        <Toggler
                                            primaryIcon={
                                                <PinOff
                                                    size={16}
                                                    className="absolute shrink-0 scale-100 opacity-100 transition-all group-data-[state=on]:scale-0 group-data-[state=on]:opacity-0  text-green-500"
                                                    aria-hidden="true"
                                                />
                                            }
                                            secondaryIcon={
                                                <Pin
                                                    size={16}
                                                    className="shrink-0 scale-0 opacity-0 transition-all group-data-[state=on]:scale-100 group-data-[state=on]:opacity-100"
                                                    aria-hidden="true"
                                                />
                                            }
                                            state={pinnedStatus}
                                            setState={setPinnedStatus}
                                        />


                                    </NavigationMenuLink>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="bottom"
                                    className="px-2 py-1 text-xs"
                                >
                                    <p>{!pinnedStatus ? "Pin" : "Unpin"}</p>
                                </TooltipContent>
                            </Tooltip>
                            {/* toggler for pin and unpin */}
                            <Tooltip open={copyStatus ? true : undefined}>
                                <TooltipTrigger asChild>
                                    <NavigationMenuLink
                                        className="flex size-8 items-center justify-center p-1.5"
                                        onClick={handleCopyEvent}
                                    >
                                        <Toggler
                                            primaryIcon={
                                                <CopyCheck
                                                    size={16}
                                                    className="absolute shrink-0 scale-100 opacity-100 transition-all group-data-[state=on]:scale-0 group-data-[state=on]:opacity-0  text-green-500"
                                                    aria-hidden="true"
                                                />
                                            }
                                            secondaryIcon={
                                                <Copy
                                                    size={16}
                                                    className="shrink-0 scale-0 opacity-0 transition-all group-data-[state=on]:scale-100 group-data-[state=on]:opacity-100"
                                                    aria-hidden="true"
                                                />
                                            }
                                            state={copyStatus}
                                            setState={setCopyStatus}
                                        />


                                    </NavigationMenuLink>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="bottom"
                                    className="px-2 py-1 text-xs"
                                >
                                    <p>{!copyStatus ? "Copy" : "Copied"}</p>
                                </TooltipContent>
                            </Tooltip>
                            {/* delete btn */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <NavigationMenuLink
                                        className="flex size-8 items-center justify-center p-1.5"
                                        onClick={handleDelete}
                                    >
                                        <Trash size={20} aria-hidden="true" />
                                        <span className="sr-only">Delete</span>
                                    </NavigationMenuLink>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="bottom"
                                    className="px-2 py-1 text-xs"

                                >
                                    <p>Delete</p>
                                </TooltipContent>
                            </Tooltip>
                            {/* toggler for magic title */}
                            <Tooltip open={magicTitleLoading ? true : undefined}>
                                <TooltipTrigger asChild>
                                    <NavigationMenuLink
                                        className="flex size-8 items-center justify-center p-1.5"
                                        onClick={handleMagicTitle}
                                    >
                                        <Toggler
                                            disabled={magicTitleLoading}
                                            primaryIcon={
                                                <Loader2
                                                    size={16}
                                                    className="absolute animate-spin shrink-0 scale-100 opacity-100 transition-all group-data-[state=on]:scale-0 group-data-[state=on]:opacity-0  text-green-500"
                                                    aria-hidden="true"
                                                />
                                            }
                                            secondaryIcon={
                                                <WandSparkles
                                                    size={16}
                                                    className="shrink-0 scale-0 opacity-0 transition-all group-data-[state=on]:scale-100 group-data-[state=on]:opacity-100"
                                                    aria-hidden="true"
                                                />
                                            }
                                            state={magicTitleLoading}
                                            setState={setMagicTitleLoading}
                                        />


                                    </NavigationMenuLink>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="bottom"
                                    className="px-2 py-1 text-xs"
                                >
                                    <p>{!magicTitleLoading ? "Magic title" : "Loading"}</p>
                                </TooltipContent>
                            </Tooltip>
                            {/* toggler for magic description content note */}
                            <Tooltip open={magicDescriptionLoading ? true : undefined}>
                                <TooltipTrigger asChild>
                                    <NavigationMenuLink
                                        className="flex size-8 items-center justify-center p-1.5"
                                        onClick={handleMagicNote}
                                    >
                                        <Toggler
                                            disabled={magicDescriptionLoading}
                                            primaryIcon={
                                                <Loader2
                                                    size={16}
                                                    className="absolute animate-spin shrink-0 scale-100 opacity-100 transition-all group-data-[state=on]:scale-0 group-data-[state=on]:opacity-0  text-green-500"
                                                    aria-hidden="true"
                                                />
                                            }
                                            secondaryIcon={
                                                <Sparkles
                                                    size={16}
                                                    className="shrink-0 scale-0 opacity-0 transition-all group-data-[state=on]:scale-100 group-data-[state=on]:opacity-100"
                                                    aria-hidden="true"
                                                />
                                            }
                                            state={magicDescriptionLoading}
                                            setState={setMagicDescriptionLoading}
                                        />


                                    </NavigationMenuLink>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="bottom"
                                    className="px-2 py-1 text-xs"
                                >
                                    <p>{!magicDescriptionLoading ? "du-be-doos" : "Loading"}</p>
                                </TooltipContent>
                            </Tooltip>
                        </NavigationMenuItem>}

                </TooltipProvider>
            </NavigationMenuList>
        </NavigationMenu>


        <div className="relative">
            {!visible &&
                <div className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded pointer-events-auto z-10 w-full h-full"></div>
            }
            {/* title of big todo */}
            <QuickInput id={id} placeHolder="Note Title" className="p-2 text-ring text-sm border-none bg-transparent shadow-none" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isEditing} />
            {/* content of big todo */}
            <AutoGrowTextarea className={`border-t-1 border-b-0 border-r-0 border-l-0 ${!isEditing && borderColor}`} id={id} value={content} setContent={setContent} disabled={isEditing}>Your notes' description...</AutoGrowTextarea>


            {/* images */}
            {images.length > 0 && (
                <div className="flex gap-3 flex-wrap pb-2">
                    {images.map((image, index) => (
                        <div className="w-24 aspect-square rounded-md relative group" key={index}>
                            {/* Image with carousel click handler */}
                            <Image
                                className="w-full h-full aspect-square object-cover cursor-context-menu"
                                src={image?.secure_url}
                                alt={image?.public_id}
                                width={100}
                                height={100}
                                onClick={() => setShowCarousel(true)}
                            />

                            {/* Delete button in corner */}
                            <div
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteImage(image.public_id);
                                    }}
                                    className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                                >
                                    <Trash size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* footer of todo with few info */}
            <p className="text-muted-foreground text-[10px] sm:text-xs text-right" > Chars : {countWordsAndChars(content).characters} ‎ ‎ ‎ Words : {countWordsAndChars(content).words}‎ ‎ |‎ ‎ <TimeDisplay timestamp={Number(date)} /></p>
        </div>

    </div >


    if (animate && !showCarousel) {
        return (
            <Heartbeatdiv>
                {body}
            </Heartbeatdiv>
        )
    }

    return body
}

export default BigTodo