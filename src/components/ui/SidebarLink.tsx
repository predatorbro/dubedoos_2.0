"use client";
import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext, memo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, SidebarClose, SidebarOpen } from "lucide-react";
import Image from "next/image";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}
interface LinkItem {
  label: string;
  url: string;
  favicon: string | null;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = memo(({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
});

export const Sidebar = memo(({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
});

export const SidebarBody = memo((props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <TabletSidebar {...(props as React.ComponentProps<"div">)} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
});

export const DesktopSidebar = memo(({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();

  return (
    <>
      <motion.div
        className={cn(
          "h-full pt-1 hidden  lg:flex md:flex-col bg-neutral-100 dark:bg-neutral-800  w-[300px]  shrink-0",
          className
        )}
        animate={{
          width: animate ? (open ? "300px" : "75px") : "300px",
        }}
        {...props}
      >
        {children}
      </motion.div>
    </>
  );
});

// tablet sidebar messed up last time
export const TabletSidebar = memo(({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();

  return (
    <div
      className={cn(
        "hidden md:flex lg:hidden items-center bg-accent dark:bg-accent w-full",
        className
      )}
      {...props}
    >
      {/* Menu button */}
      <div className="flex justify-center z-20 w-12 lg:w-full cursor-pointer" onClick={() => setOpen(!open)}>
        {open ? <SidebarClose /> : <SidebarOpen />}
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {open && (
          <div
            className={cn(
              " h-full w-full bg-white dark:bg-neutral-900 z-[100] flex flex-col justify-between shadow-lg",
            )}
          >
            {children}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
});


export const MobileSidebar = memo(({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-0 flex flex-row md:hidden  items-center justify-between bg-neutral-100 dark:bg-neutral-800  "
        )}
        {...props}
      >
        <div className="absolute z-20 top-7 left-8 flex">
          <Menu
            className="text-neutral-800 dark:text-neutral-200"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-white dark:bg-neutral-900 p-10 z-[100] flex flex-col justify-between",
                className
              )}
            >

              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
});

const SidebarLinkComponent = () => {
  const { open } = useSidebar();
  const categories = useSelector((state: RootState) => state.bookmark.links);
  return (
    <div className={"flex flex-col gap-2"}>
      {categories.map((cat, idx) => (
        <div key={idx} className="flex flex-col gap-1">
          {/* Category title */}
          <span
            className={cn(
              "px-2 text-xs font-semibold text-neutral-400 uppercase",
              !open && "hidden"
            )}
          >
            {cat.category}
          </span>

          {/* Links in category */}
          {cat.links.map((link, linkIdx) => (
            <a
              key={linkIdx}
              href={link.url}
              target="_blank"
              className={`flex items-center gap-2 py-1 px-2 hover:bg-neutral-200 dark:hover:bg-neutral-700
                          rounded-md transition-colors ${!open && "p-0 w-10 h-10 justify-center items-center"}`}
            >
              {link.favicon ? (
                <Image
                  src={link.favicon}
                  alt={`${link.label} icon`}
                  width={24}
                  height={24}
                  className="rounded-sm object-contain w-6 h-6"
                />
              ) : (
                <span className="text-sm text-gray-700 dark:text-gray-800 font-semibold bg-neutral-400/40 w-6 h-6 rounded-full flex items-center justify-center">
                  {link.label?.charAt(0).toUpperCase()}
                </span>
              )}

              <div
                className={`${open ? "block" : "hidden"
                  } text-neutral-700 dark:text-neutral-200 text-sm whitespace-pre !p-0 !m-0`}
              >
                {link.label}
              </div>

            </a>

          ))}

          {/* Divider between categories */}
          {idx < categories.length - 1 && (
            <hr className="border-t border-neutral-300 dark:border-neutral-600 my-1 mx-2" />
          )}
        </div>
      ))}
    </div>
  );
};

export const SidebarLink = memo(SidebarLinkComponent);

