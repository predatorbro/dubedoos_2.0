"use client";

import { useState, useCallback, memo, useEffect, useRef } from "react";
import axios from "axios";
import { MessageCircle } from "lucide-react";
import Heartbeatdiv from "./Heartbeatdiv";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ChatBot = memo(() => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
        { role: "assistant", content: "Hi! I’m here to guide you around this app. How can I help?" }
    ]);
    const [input, setInput] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(true);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const inputRowRef = useRef<HTMLDivElement | null>(null);

    const toggleOpen = useCallback(() => setOpen(prev => !prev), []);

    const sendMessage = useCallback(async (text?: string) => {
        const content = (text ?? input).trim();
        if (!content) return;
        setMessages(prev => [...prev, { role: "user", content }]);
        setInput("");
        if (text) setShowSuggestions(false);

        try {
            const { data } = await axios.post("/api/aiassistance", { message: content });
            const action = (data?.action || "chat").toLowerCase();
            if (["todo", "note", "both"].includes(action)) {
                // Close modal to avoid overlay blocking clicks
                setOpen(false);
                await new Promise(res => setTimeout(res, 500));
                await performUiAutomation(action as "todo" | "note" | "both", {
                    title: data?.title || "",
                    description: data?.description || "",
                    todo: data?.todo || "",
                });
                setMessages(prev => [...prev, { role: "assistant", content: `Done. ${action === "both" ? "Added a note and a todo." : `Added a ${action}.`}` }]);
            } else {
                const replyRaw = data?.description || data?.title || getAssistantReply(content);
                const reply = sanitizeText(replyRaw);
                setMessages(prev => [...prev, { role: "assistant", content: reply }]);
            }
        } catch (err: any) {
            const msg = err?.response?.data?.error || "Something went wrong while contacting the assistant.";
            setMessages(prev => [...prev, { role: "assistant", content: msg }]);
        }
    }, [input]);

    // UI automation without puppeteer
    const performUiAutomation = async (
        action: "todo" | "note" | "both",
        payload: { title: string; description: string; todo: string }
    ) => {
        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

        // Ensure React-controlled inputs receive proper setter calls so onChange updates state
        const setReactInputValue = (el: HTMLInputElement | HTMLTextAreaElement, value: string) => {
            const prototype = Object.getPrototypeOf(el);
            const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
            if (descriptor && descriptor.set) {
                descriptor.set.call(el, value);
            } else {
                (el as any).value = value;
            }
            el.dispatchEvent(new Event("input", { bubbles: true }));
            el.dispatchEvent(new Event("change", { bubbles: true }));
        };

        const addQuickee = async (text: string) => {
            const inputEl = document.querySelector<HTMLInputElement>("#quick-input");
            const addBtn = document.querySelector<HTMLButtonElement>("#add-quickee-button");
            if (!inputEl || !addBtn) return;
            inputEl.focus();
            await delay(100);
            setReactInputValue(inputEl, text);
            await delay(250);
            addBtn.click();
            await delay(200);
            inputEl.blur();
        };

        const addOne = async (title: string, body: string) => {
            // Try desktop options path first
            const openBtn = document.querySelector<HTMLButtonElement>(".open-section-navigation");
            if (openBtn) {
                openBtn.click();
                await delay(1000);
                let firstOpt = document.querySelector<HTMLElement>(".section-navigation > :first-child > button");
                if (!firstOpt) {
                    openBtn.click();
                    await delay(500);
                    firstOpt = document.querySelector<HTMLElement>(".section-navigation > :first-child > button");
                }
                if (firstOpt) {
                    firstOpt.dispatchEvent(new MouseEvent("click", { bubbles: true }));
                    await delay(500);
                }
            } else {
                // Fallback: mobile popover path
                const mobileTrigger = document.querySelector<HTMLButtonElement>(".section-node .md\\:hidden");
                if (mobileTrigger) {
                    mobileTrigger.click();
                    await delay(200);
                    const addItem = document.querySelector<HTMLElement>("[id^='add-note-']");
                    addItem?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
                    await delay(300);
                }
            }

            const notesContainer = document.querySelector<HTMLElement>(".notes-render-area");
            const lastCard = notesContainer?.lastElementChild as HTMLElement | null;
            if (!lastCard) return;

            // Enter title
            const input = lastCard.querySelector<HTMLInputElement>("input#quick-input, input");
            if (input) {
                input.focus();
                setReactInputValue(input, title);
                input.blur();
            }
            await delay(100);

            // Enter content
            const textarea = lastCard.querySelector<HTMLTextAreaElement>("textarea#auto-grow-textarea, textarea");
            if (textarea) {
                textarea.focus();
                setReactInputValue(textarea, body);
                textarea.blur();
            }
            await delay(150);

            // Toggle Edit -> Save using the second tooltip trigger (Edit/Save toggler)
            const triggers = lastCard.querySelectorAll<HTMLElement>("[data-slot=\"tooltip-trigger\"]");
            const editSave = triggers?.[1];
            if (editSave) {
                // Enter editing
                editSave.click();
                await delay(150);
                // Save (toggle back)
                editSave.click();
            }

            // Ensure the card is in view
            lastCard.scrollIntoView({ behavior: "smooth", block: "end" });
        };

        if (action === "todo" || action === "both") {
            await addQuickee(payload.todo || payload.title || payload.description || "New Quickee");
        }
        if (action === "note" || action === "both") {
            await addOne(payload.title || "New Note", payload.description || payload.todo || "");
        }
    };

    // Strip any code fences/backticks that may slip through
    const sanitizeText = (t: string) => (t || "").replace(/```[\s\S]*?```/g, (m) => m.replace(/```json|```/g, "")).trim();

    const getAssistantReply = (q: string) => {
        const lc = q.toLowerCase();
        if (lc.includes("todo") || lc.includes("grocery")) return "To create a todo: open a section, click ‘Add new note’, give it a title like ‘Buy grocery’, add details, and save.";
        if (lc.includes("note") || lc.includes("science")) return "For a science project note: add a note in your section, attach images or deadlines, and use the magic title/notes helpers if needed.";
        if (lc.includes("how") || lc.includes("use") || lc.includes("help")) return "Use the sidebar for bookmarks, the top bar for navigation, and the section actions to add notes or change layouts. Ask for any specific action!";
        return "Got it. Tell me what you want to do and I’ll guide you step-by-step.";
    };

    const suggestions = [
        "Create a todo: Buy grocery",
        "Make a note for science project work",
        "How to use this app",
    ];

    // Auto-scroll to bottom when messages change or dialog opens
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, open]);

    // Keyboard shortcut: Ctrl+C to toggle assistant (avoids when typing in inputs)
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            const isTyping = !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
            if (e.ctrlKey && (e.key === 'c' || e.key === 'C') && !isTyping) {
                e.preventDefault();
                setOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    // Auto-focus input when dialog opens
    useEffect(() => {
        if (open) {
            setTimeout(() => {
                const inputEl = inputRowRef.current?.querySelector('input');
                (inputEl as HTMLInputElement | null)?.focus();
            }, 0);
        }
    }, [open]);

    return (
        <>
            {/* Floating assistant button */}
            <div className="fixed bottom-6 right-6 z-50">
                <Heartbeatdiv delay={0}>
                    <button
                        id="assistant-fab"
                        aria-label="Open assistant"
                        onClick={toggleOpen}
                        className="shadow-md border bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-full w-14 h-14 flex items-center justify-center hover:opacity-90 transition-opacity"
                    >
                        <MessageCircle className="w-6 h-6" />
                    </button>
                </Heartbeatdiv>
            </div>

            {/* Centered guidance modal */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Assistant</DialogTitle>
                        <DialogDescription>
                            Ask anything about quickees, notes, layout, or navigation.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Chat area */}
                    <div className="flex flex-col gap-3">
                        <div ref={scrollRef} className="h-80 md:h-96 lg:h-[28rem] overflow-y-auto rounded-md border p-3 bg-neutral-50 dark:bg-neutral-900/50">
                            <div className="flex flex-col gap-3 text-sm">
                                {messages.map((m, i) => (
                                    <div key={i} className={m.role === "user" ? "self-end max-w-[85%] px-3 py-2 rounded-lg bg-primary text-primary-foreground" : "self-start max-w-[85%] px-3 py-2 rounded-lg bg-muted"}>
                                        {m.content}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Suggestions */}
                        {showSuggestions && (
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map((s, i) => (
                                    <Button key={i} variant="outline" size="sm" onClick={() => sendMessage(s)}>
                                        {s}
                                    </Button>
                                ))}
                            </div>
                        )}

                        {/* Input row */}
                        <div className="flex gap-2" ref={inputRowRef}>
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your question…"
                                onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                            />
                            <Button onClick={() => sendMessage()} disabled={!input.trim()}>Send</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
});

export default ChatBot;


