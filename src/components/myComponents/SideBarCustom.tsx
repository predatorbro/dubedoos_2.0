"use client";
import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../ui/sidebar";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Menu, SidebarClose, SidebarOpen } from "lucide-react";
import LinkSaverModal, { LinkCategory } from "@/components/myComponents/LinkSaver";



export function SideBarCustom({ children }: { children: React.ReactNode }) {

    const [links, setLinks] = useState<LinkCategory[]>([])
    const [open, setOpen] = useState(true);

    useEffect(() => {
        const storedLinks = localStorage.getItem("Links");
        if (storedLinks) {
            setLinks(JSON.parse(storedLinks));
        }
        setOpen(window.innerWidth < 1024 ? false : true)
    }, []);

    useEffect(() => {
        localStorage.setItem("Links", JSON.stringify(links));
    }, [links]);

    const toggleOpen = useCallback(() => {
        setOpen(prev => !prev);
    }, []);

    const sidebarBodyClass = useMemo(() => (
        ` h-full  border-r bg-neutral-300 transition-all duration-500 ease-in-out  ${open ? "md:absolute md:w-1/2 z-50 lg:relative lg:w-auto" : ""}`
    ), [open]);

    const menuHeader = useMemo(() => (
        <>
            {open && (
                <motion.span
                    animate={{
                        display: open ? "inline-block" : "none",
                        opacity: open ? 1 : 0,
                    }}
                    className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
                >
                    <div className="text-center text-2xl font-semibold flex justify-center items-center gap-2">
                        <Menu />
                        menu
                    </div>
                </motion.span>
            )}
        </>
    ), [open]);

    const toggleIcon = useMemo(() => (
        open ? <SidebarClose /> : <SidebarOpen />
    ), [open]);

    return (
        <div
            className={cn(
                " mx-auto flex w-full flex-1 flex-col border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800",
                "h-screen w-screen",
            )}
        >
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
            >
                <Sidebar open={open} animate={true} setOpen={setOpen}>
                    <SidebarBody className={sidebarBodyClass}>

                        {/* heading */}
                        <div className={`w-full h-fit p-6 pb-0 ${open ? "flex items-center justify-between" : ""}`}>
                            {menuHeader}
                            <span className="block md:hidden lg:block cursor-pointer" onClick={toggleOpen}>
                                {toggleIcon}
                            </span>
                        </div>
                        {/* body */}
                        <div className="flex flex-col flex-1 overflow-y-auto overflow-hidden p-4 pt-0">
                            <div className="mt-8 flex flex-col gap-2">
                                <SidebarLink categories={links} />
                            </div>
                        </div>

                        {/* add link modal */}
                        {open && <LinkSaverModal setLinks={setLinks} Links={links} />}
                        {/* <div className="absolute bottom-0 w-full">
                        </div> */}
                    </SidebarBody>
                </Sidebar>
            </motion.div>
            <Dashboard >
                {children}
            </Dashboard >
        </div >
    );
}

// Dummy dashboard component with content
const Dashboard = memo(({ children }: { children: React.ReactNode }) => {
    return (
        <div id="dashboard" className="flex-1 overflow-y-auto border-l border-neutral-200 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-900">
            {children}
        </div>
    );
});
