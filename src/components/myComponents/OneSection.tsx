import { memo, useState, useCallback, useMemo } from "react";
import QuickInput from "../QuickInput";
import { ChevronDown, Grid2X2, Grid3X3, LayoutDashboard, Plus, Rows3, Trash2 } from "lucide-react";
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

// Move these outside component to prevent recreation
const DESKTOP_LAYOUT_OPTIONS = {
    ONE_COL: "md:grid-cols-1",
    TWO_COL: "md:grid-cols-2",
    THREE_COL: "xl:grid-cols-3"
};

// Memoized sub-components
const PopoverDesktop = memo(({
    desktopOptions,
}: {
    desktopOptions: Array<{ id: string; onClick: () => void; icon: any }>;
}) => {
    const [showOptions, setShowOptions] = useState(false);

    const toggleOptions = useCallback(() => {
        setShowOptions(!showOptions);
    }, [showOptions, setShowOptions]);


    // Memoized computed values
    const optionsWidth = useMemo(() =>
        showOptions ? (desktopOptions.length + 1) * 60 : 60
        , [showOptions]);

    return (
        <div
            className="hidden md:flex items-center justify-end gap-2 relative"
            style={{ width: optionsWidth }}
        >
            <Button
                variant="outline"
                size="icon"
                onClick={toggleOptions}
                className="open-section-navigation w-12 h-12 flex justify-center items-center relative z-10"
            >
                <motion.div
                    animate={{ rotate: showOptions ? 90 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <ChevronDown size={20} />
                </motion.div>
            </Button>

            <AnimatePresence>
                {showOptions && (
                    <motion.div
                        className="section-navigation absolute right-14 flex gap-2 ml-2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ staggerChildren: 0.1 }}
                    >
                        {desktopOptions.map((opt) => (
                            <motion.div
                                key={opt.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Button
                                    id={opt.id}
                                    variant="outline"
                                    className="aspect-square h-full"
                                    onClick={opt.onClick}
                                >
                                    <opt.icon />
                                </Button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

const PopoverMobile = memo(({ navigationLinks }: { navigationLinks: Array<any> }) => (
    <Popover>
        <PopoverTrigger asChild>
            <Button
                className="[&>svg]:text-muted-foreground/80 hover:bg-accent hover:text-accent-foreground 
                      md:hidden w-fit py-5 shadow-none 
                    [&>svg]:shrink-0 flex justify-center aspect-square"
                variant="outline"
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
                    {navigationLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <NavigationMenuItem
                                id={link.id}
                                key={link.id}
                                className="w-full"
                                onClick={link.onClick}
                            >
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
                        );
                    })}
                </NavigationMenuList>
            </NavigationMenu>
        </PopoverContent>
    </Popover>
));

const SectionNotesRenderArea = memo(({
    sectionNotes,
    sectionID
}: {
    sectionNotes: Note[];
    sectionID: string;
}) => {
    const pinnedNotes = useMemo(() =>
        sectionNotes.filter(note => note.pinned),
        [sectionNotes]
    );

    const regularNotes = useMemo(() =>
        sectionNotes.filter(note => !note.pinned),
        [sectionNotes]
    );

    return (
        <>
            <AnimatePresence mode="popLayout">
                {pinnedNotes.map((note, index) => (
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
                {regularNotes.map((note, index) => (
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
        </>
    );
});

const QuickInputInstance = memo(({
    sectionID,
    sectionTitle
}: {
    sectionID: string;
    sectionTitle: string;
}) => {
    const [titleState, setTitleState] = useState<string>(sectionTitle);
    const dispatch = useDispatch<AppDispatch>();

    const handleTitleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        dispatch(editSectionTitle({ title: titleState, sectionID }));
    }, [dispatch, titleState, sectionID]);

    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTitleState(e.target.value);
    }, []);

    return (
        <QuickInput
            id={sectionID}
            onBlur={handleTitleBlur}
            value={titleState}
            onChange={handleTitleChange}
            placeHolder="Section Title..."
            className="text-ring font-semibold pr-0 text-2xl border-0"
            disabled
        />
    );
});

function OneSection({ sectionData }: { sectionData: any }) {
    const { sectionID, sectionTitle, sectionNotes } = sectionData;
    const dispatch = useDispatch<AppDispatch>();

    const [confirmationText, setConfirmationText] = useState<string>("");
    const { confirm, ConfirmDialog } = useConfirmDialog({ text: confirmationText });
    const { showLoader, hideLoader } = useLoader();

    // Layout states
    const [layoutMobile, setLayoutMobile] = useState<boolean>(false);
    const [layoutDesktop, setLayoutDesktop] = useState(DESKTOP_LAYOUT_OPTIONS.TWO_COL);

    // Memoized handlers
    const handleDelete = useCallback(async () => {
        setConfirmationText(`Do you want to delete ${sectionTitle || "this section"}?`);
        const result = await confirm();
        if (result) {
            dispatch(deleteSection(sectionID));
            showLoader({
                message: "Processing your request...",
                timeout: 1000,
                dismissible: false,
                onTimeout: () => toast.success('Section deleted successfully!')
            });
        }
    }, [confirm, dispatch, sectionID, sectionTitle, showLoader]);

    const addNewNote = useCallback(() => {
        dispatch(addNote(sectionID));
    }, [dispatch, sectionID]);

    const toggleLayoutMobile = useCallback(() => {
        setLayoutMobile(prev => !prev);
    }, []);

    const setLayoutOneCol = useCallback(() => {
        setLayoutDesktop(DESKTOP_LAYOUT_OPTIONS.ONE_COL);
    }, []);

    const setLayoutTwoCol = useCallback(() => {
        setLayoutDesktop(DESKTOP_LAYOUT_OPTIONS.TWO_COL);
    }, []);

    const setLayoutThreeCol = useCallback(() => {
        setLayoutDesktop(DESKTOP_LAYOUT_OPTIONS.THREE_COL);
    }, []);

    // Memoized navigation links
    const navigationLinks = useMemo(() => [
        {
            id: `add-note-${sectionID}`,
            onClick: addNewNote,
            label: "Add new note",
            icon: Plus,
            active: true
        },
        {
            id: `toggle-layout-${sectionID}`,
            onClick: toggleLayoutMobile,
            label: "Change Layout",
            icon: LayoutDashboard
        },
        {
            id: `delete-section-${sectionID}`,
            onClick: handleDelete,
            label: "Delete Section",
            icon: Trash2
        },
    ], [sectionID, addNewNote, toggleLayoutMobile, handleDelete]);

    const desktopOptions = useMemo(() => [
        { id: `add-note-${sectionID}`, onClick: addNewNote, icon: Plus },
        { id: `layout-1col-${sectionID}`, onClick: setLayoutOneCol, icon: Rows3 },
        { id: `layout-2col-${sectionID}`, onClick: setLayoutTwoCol, icon: Grid2X2 },
        { id: `layout-3col-${sectionID}`, onClick: setLayoutThreeCol, icon: Grid3X3 },
        { id: `delete-section-${sectionID}`, onClick: handleDelete, icon: Trash2 },
    ], [sectionID, addNewNote, setLayoutOneCol, setLayoutTwoCol, setLayoutThreeCol, handleDelete]);

    const gridClassName = useMemo(() =>
        `notes-render-area rounded-md h-fit grid gap-3 ${layoutMobile ? "grid-cols-2 sm:grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
        } ${layoutDesktop}`
        , [layoutMobile, layoutDesktop]);

    // Prevent propagation handler
    const handleHeaderClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
    }, []);

    return (
        <div className="section-node border rounded-md w-full p-3 mb-5" onDoubleClick={addNewNote}>
            {ConfirmDialog}
            <div
                className="flex gap-2 md:gap-0 pb-3 justify-between items-center"
                onDoubleClick={handleHeaderClick}
            >
                <QuickInputInstance sectionID={sectionID} sectionTitle={sectionTitle} />
                <PopoverMobile navigationLinks={navigationLinks} />
                <PopoverDesktop
                    desktopOptions={desktopOptions}
                />
            </div>

            <div className={gridClassName}>
                <SectionNotesRenderArea
                    sectionNotes={sectionNotes}
                    sectionID={sectionID}
                />
            </div>
        </div>
    );
}

export default memo(OneSection);