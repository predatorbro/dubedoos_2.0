"use client";
import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../ui/SidebarLink";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Bookmark, SidebarClose, SidebarOpen, Sparkles } from "lucide-react";
import LinkSaverModal from "@/components/myComponents/LinkSaver";

export const SideBarCustom = memo(({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = useState(true);

    useEffect(() => {
        setOpen(window.innerWidth < 1024 ? false : true);
    }, []);

    const toggleOpen = useCallback(() => {
        setOpen(prev => !prev);
    }, []);

    // Keyboard shortcut handler for Ctrl+B
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === 'b') {
                event.preventDefault(); // Prevent browser's default bookmark action
                toggleOpen();
            }
        };

        // Add event listener
        document.addEventListener('keydown', handleKeyDown);

        // Cleanup event listener on component unmount
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [toggleOpen]);

    const sidebarBodyClass = useMemo(() => (
        `h-full border-r border-border/50 bg-card transition-all duration-300 ease-in-out shadow-lg ${open ? "md:absolute md:w-1/2 z-30 lg:relative lg:w-auto" : ""}`
    ), [open]);

    const menuHeader = useMemo(() => (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center gap-3 py-2"
                >
                    <div className="relative">
                        <Bookmark className="w-6 h-6 text-primary" />
                        <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-1 -right-1"
                        >
                            <Sparkles className="w-3 h-3 text-yellow-500" />
                        </motion.div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-foreground">Bookmarks</span>
                        <span className="text-xs text-muted-foreground">Organize your links</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    ), [open]);

    const toggleIcon = useMemo(() => (
        <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
            onClick={toggleOpen}
        >
            {open ? <SidebarClose className="w-5 h-5" /> : <SidebarOpen className="w-5 h-5" />}
        </motion.div>
    ), [open, toggleOpen]);

    // Memoize the sidebar link component to prevent re-renders
    const memoizedSidebarLink = useMemo(() => <SidebarLink />, []);

    // Memoize the link saver modal to prevent re-renders
    const memoizedLinkSaver = useMemo(() => <LinkSaverModal />, []);

    return (
        <div
            className={cn(
                "mx-auto flex w-full flex-1 flex-col bg-background md:flex-row h-screen",
            )}
        >
            <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
            >
                <Sidebar open={open} animate={true} setOpen={setOpen}>
                    <SidebarBody className={sidebarBodyClass}>
                        {/* Header */}
                        <div className={`w-full h-fit md:p-4 pb-2 ${open ? "flex items-center justify-between" : "flex justify-center"}`}>
                            {menuHeader}
                            <div className="flex items-center">
                                {toggleIcon}
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex flex-col flex-1 overflow-y-auto overflow-hidden px-4 pb-4">
                            <div className="flex flex-col gap-1">
                                {memoizedSidebarLink}
                            </div>
                        </div>

                        {/* Add link modal */}
                        <AnimatePresence>
                            {open && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ duration: 0.2 }}
                                    className="px-4 pb-4"
                                >
                                    {memoizedLinkSaver}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </SidebarBody>
                </Sidebar>
            </motion.div>

            <Dashboard>
                {children}
            </Dashboard>
        </div>
    );
});

// Main content area with improved theming
const Dashboard = memo(({ children }: { children: React.ReactNode }) => {
    return (
        <div id="dashboard" className="flex-1 overflow-y-auto border-l border-border/50 bg-background">
            {children}
        </div>
    );
});
