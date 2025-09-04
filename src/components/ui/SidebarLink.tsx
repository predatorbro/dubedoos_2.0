"use client";
import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext, memo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, SidebarClose, SidebarOpen, Bookmark } from "lucide-react";
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
          "h-full pt-1 hidden lg:flex md:flex-col bg-card border-r border-border/50 w-[300px] shrink-0",
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

// tablet sidebar
export const TabletSidebar = memo(({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();

  return (
    <div
      className={cn(
        "hidden md:flex lg:hidden items-center bg-card w-full",
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
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "h-full w-full bg-card border-r border-border/50 z-20 flex flex-col shadow-lg",
            )}
          >
            {children}
          </motion.div>
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
          "h-0 flex flex-row md:hidden items-center justify-between bg-card"
        )}
        {...props}
      >
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
                "fixed h-full w-full inset-0 bg-card p-6 z-20 flex flex-col",
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
    <div className="flex flex-col gap-2">
      {categories.map((cat, idx) => (
        <motion.div
          key={idx}
          className="flex flex-col gap-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.1 }}
        >
          {/* Category title */}
          <AnimatePresence>
            {open && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="px-3 text-xs font-bold text-primary uppercase tracking-wider mb-1"
              >
                {cat.category}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Links in category */}
          <div className="flex flex-col gap-0.5">
            {cat.links.map((link, linkIdx) => (
              <motion.a
                key={linkIdx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-3 py-1.5 px-3 rounded-lg transition-all duration-200 group",
                  "hover:bg-accent hover:shadow-sm border border-transparent hover:border-border/50",
                  !open && "p-2 w-10 h-10 justify-center items-center"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: (idx * 0.1) + (linkIdx * 0.05) }}
              >
                {/* Favicon/Icon */}
                <div className="flex-shrink-0 flex items-center justify-center w-5 h-5">
                  {link.favicon ? (
                    <Image
                      src={link.favicon}
                      alt={`${link.label} icon`}
                      width={20}
                      height={20}
                      className="rounded-md object-contain w-5 h-5"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-md bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">
                        {link.label?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Link label */}
                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="flex-1 min-w-0 flex flex-col justify-center"
                    >
                      <span className="text-sm font-medium text-foreground truncate block group-hover:text-primary transition-colors leading-tight">
                        {link.label}
                      </span>
                      <span className="text-xs text-muted-foreground truncate hidden group-hover:block transition-all leading-tight">
                        {new URL(link.url).hostname}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* External link indicator */}
                {open && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                    className="text-muted-foreground group-hover:text-primary transition-colors flex items-center justify-center w-3 h-3"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </motion.div>
                )}
              </motion.a>
            ))}
          </div>

          {/* Elegant divider between categories */}
          {idx < categories.length - 1 && (
            <motion.div
              className="mx-3 my-1"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </motion.div>
          )}
        </motion.div>
      ))}

      {/* Empty state */}
      {categories.length === 0 && open && (
        <motion.div
          className="text-center py-8 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
            <Bookmark className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            {open ? "No bookmarks yet" : ""}
          </p>
          {open && (
            <p className="text-xs text-muted-foreground mt-1">
              Add your first link below
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const SidebarLink = memo(SidebarLinkComponent);
