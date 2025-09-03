"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const instructions = [
  "Double click on a Quickee to enhance it.",
  "Use Magic Buttons to enhance notes.",
  "Set Pin to hide and unhide notes.",
  "Double click on a Section to create a new note.",
  "Click on any Date to save notes for a specific day.",
  "Use Deadline feature to get updates about time left for project.",
];


const techStack = {
  Languages: ["TypeScript", "JavaScript"],
  Frameworks: ["Next.js", "React", "Mongoose", "TailwindCSS", "Redux", "Tailwind-animate"],
  "UI / NPM": ["shadcn/ui", "framer-motion", "lucide-react", "usehooks-ts", "bcryptjs", "next-theme"],
  API: ["Next.js Server", "axios"],
  "Database & Cloud Services": ["MongoDB", "Cloudinary"],
  "Authentication & AI": ["NextAuth", "Gemini API"],
  "Version Control": ["Git", "GitHub"],
};


export function InstructionsModal({ isOpen, onClose }: InstructionsModalProps) {
  const [showDevInfo, setShowDevInfo] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={cn(
              "relative w-[90%] max-w-lg max-h-[80vh] rounded-2xl bg-white dark:bg-neutral-900 shadow-xl flex flex-col"
            )}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground z-10"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {!showDevInfo ? (
                <>
                  <h2 className="text-xl font-semibold mb-4 text-foreground">
                    How to Use
                  </h2>
                  <ul className="space-y-3 text-base text-muted-foreground">
                    {instructions.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 rounded-xl border border-border p-3 hover:bg-muted/40 transition"
                      >
                        <span className="font-medium text-primary">
                          {index + 1}.
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <h2 className="text-xl border-b font-semibold mb-4 text-foreground absolute inset-0 bg-white dark:bg-neutral-900 h-fit p-6 pb-2 rounded-tr-2xl rounded-tl-2xl">
                    Dev Info
                  </h2>
                  <p className="text-muted-foreground text-base mt-10 mb-4">
                    <strong>du-be-doos 2.0,</strong> is a simple yet powerful
                    note-taking project designed to boost productivity. It helps
                    users stay organized, enhance notes effortlessly, and clear
                    the clutter of the mind. With smart features like Quickees,
                    Magic AI Buttons, a minimalist UI, and a Deadline Tracker,
                    du-be-doos makes remembering tasks seamless.
                  </p>
                  <p className="text-sm font-semibold mb-4 text-foreground ">
                    know about developer ‎ ‎ - ‎ ‎  <a
                      href="https://prasadbhai.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-light pb-1 text-muted-foreground hover:text-primary transition-colors hover:underline"
                    >
                      Visit here!!
                    </a>
                  </p>
                  <div className="space-y-4">
                    {Object.entries(techStack).map(([category, items]) => (
                      <div key={category}>
                        <h3 className="text-sm font-semibold mb-2 text-foreground">
                          {category}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {items.map((item) => (
                            <div
                              key={item}
                              className="px-3 py-1 rounded-lg border border-border bg-muted text-sm text-foreground"
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer fixed at bottom */}
            <div className="p-4 border-t border-border flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setShowDevInfo((prev) => !prev)}
                className="rounded-xl"
              >
                {showDevInfo ? "← Back" : "Dev Info"}
              </Button>
              <Button onClick={onClose} className="rounded-xl">
                Got it
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
