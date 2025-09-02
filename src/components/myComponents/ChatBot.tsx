"use client";

import { useState, useCallback, memo, useEffect, useRef } from "react";
import axios from "axios";
import { MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Heartbeatdiv from "./Heartbeatdiv";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from 'react-markdown'
const ChatBot = memo(() => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
        { role: "assistant", content: "Hi! I'm dubedoos 2.0 , your friendly AI assistant - I'm here to guide you . How can I help?" }
    ]);
    const [input, setInput] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const inputRowRef = useRef<HTMLDivElement | null>(null);

    const toggleOpen = useCallback(() => setOpen(prev => !prev), []);
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    const sendMessage = useCallback(async (text?: string) => {
        const content = (text ?? input).trim();
        if (!content) return;
        setMessages(prev => [...prev, { role: "user", content }]);
        setInput("");

        setIsLoading(true);
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
                // Show toast notification
                if (action === "both") {
                    toast.success("✅ Successfully added a note and a todo!");
                } else if (action === "todo") {
                    toast.success("✅ Todo added successfully!");
                } else if (action === "note") {
                    toast.success("✅ Note added successfully!");
                }
            } else if (action === "link") {
                setOpen(false);
                await new Promise(res => setTimeout(res, 500));
                await performLinkAutomation({
                    linkLabel: data?.linkLabel || "",
                    linkUrl: data?.linkUrl || "",
                    category: data?.category || "",
                    newCategory: data?.newCategory || "",
                });
                setMessages(prev => [...prev, { role: "assistant", content: "Done. Added the link to bookmarks." }]);
                // Show toast notification
                toast.success("🔗 Link saved to bookmarks successfully!");
            } else if (action === "calendar") {
                setOpen(false);
                await new Promise(res => setTimeout(res, 500));
                await performCalendarAutomation({
                    date: data?.date || "",
                    calendarTodo: data?.calendarTodo || "",
                });
                setMessages(prev => [...prev, { role: "assistant", content: "Done. Added to calendar." }]);
                // Show toast notification
                toast.success("📅 Event added to calendar successfully!");
            } else {
                const replyRaw = data?.description || data?.title || getAssistantReply(content);
                const reply = sanitizeText(replyRaw);
                setMessages(prev => [...prev, { role: "assistant", content: reply }]);
            }
        } catch (err: any) {
            const msg = err?.response?.data?.error || "Something went wrong while contacting the assistant.";
            setMessages(prev => [...prev, { role: "assistant", content: msg }]);
        } finally {
            setIsLoading(false);
        }
    }, [input]);

    // UI automation without puppeteer
    const performUiAutomation = async (
        action: "todo" | "note" | "both",
        payload: { title: string; description: string; todo: string }
    ) => {

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

    // Link automation: open LinkSaver, fill label/url/category (prefer newCategory), save
    const performLinkAutomation = async (payload: { linkLabel: string; linkUrl: string; category: string; newCategory: string }) => {
        // Ensure sidebar is open by trying to find the LinkSaver trigger button; if not visible, toggle sidebar
        const findButtonByText = (text: string) => {
            const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('button'));
            return buttons.find(b => (b.textContent || '').trim().includes(text));
        };

        let trigger = findButtonByText('+ Add / Manage Links');
        if (!trigger) {
            const toggles = Array.from(document.querySelectorAll<HTMLElement>('span.cursor-pointer'));
            toggles.find(Boolean)?.click();
            await delay(400);
            trigger = findButtonByText('+ Add / Manage Links');
        }
        if (!trigger) return;
        trigger.click();
        await delay(300);

        // Scope to the dialog content
        const dialog = document.querySelector<HTMLElement>('[data-slot="dialog-content"]');
        if (!dialog) return;

        // Ensure we're in Add mode
        const addModeBtn = Array.from(dialog.querySelectorAll<HTMLButtonElement>('button')).find(b => (b.textContent || '').trim() === 'Add');
        addModeBtn?.click();
        await delay(150);

        const inputs = Array.from(dialog.querySelectorAll<HTMLInputElement>('input'));
        // Expect order: label, url, (select trigger not input), newCategory is typically the third input
        const [labelInput, urlInput] = inputs;
        const newCategoryInput = inputs.find((inp, idx) => idx > 1) || inputs[2];

        const setVal = (el: HTMLInputElement | HTMLTextAreaElement | null, v: string) => {
            if (!el) return;
            const proto = Object.getPrototypeOf(el);
            const desc = Object.getOwnPropertyDescriptor(proto, 'value');
            if (desc && desc.set) desc.set.call(el, v); else (el as any).value = v;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        };

        setVal(labelInput || null, payload.linkLabel);
        await delay(100);
        setVal(urlInput || null, payload.linkUrl);
        await delay(100);

        const catToUse = payload.newCategory || payload.category;
        if (catToUse) {
            setVal(newCategoryInput || null, catToUse);
            await delay(100);
        }

        const saveBtn = Array.from(dialog.querySelectorAll<HTMLButtonElement>('button')).find(b => (b.textContent || '').trim() === 'Save');
        saveBtn?.click();
        await delay(200);
    };

    const performCalendarAutomation = async (payload: { date: string; calendarTodo: string }) => {
        // Parse "YYYY-MM-DD" -> { year, monthIndex, day }
        const parseDate = (dateStr: string) => {
            const [year, month, day] = dateStr.split("-").map(Number);
            return {
                year,
                monthIndex: month - 1, // JS months are 0-based
                day,
            };
        };

        // Get current visible month/year from .rdp-month_grid aria-label="August 2025"
        const getCurrentMonthYear = () => {
            const monthGrid = document.querySelector<HTMLElement>(".rdp-month_grid");
            if (!monthGrid) return null;

            const ariaLabel = monthGrid.getAttribute("aria-label"); // e.g. "August 2025"
            if (!ariaLabel) return null;

            const [monthName, yearStr] = ariaLabel.split(" ");
            const year = parseInt(yearStr, 10);

            const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
            return { year, monthIndex };
        };

        // Click next or previous until correct month/year is visible
        const navigateToMonth = async (targetYear: number, targetMonthIndex: number) => {
            while (true) {
                const current = getCurrentMonthYear();
                if (!current) break;

                if (current.year === targetYear && current.monthIndex === targetMonthIndex) {
                    break; // correct month visible
                }

                if (
                    current.year < targetYear ||
                    (current.year === targetYear && current.monthIndex < targetMonthIndex)
                ) {
                    // need to go forward
                    document.querySelector<HTMLButtonElement>('[aria-label="Next month"], .rdp-button_next')?.click();
                } else {
                    // need to go backward
                    document.querySelector<HTMLButtonElement>('[aria-label="Previous month"], .rdp-button_previous')?.click();
                }

                await delay(300); // wait for UI to update
            }
        };

        // --- Main Flow ---
        await delay(150);
        if (!payload.date) return;

        const { year, monthIndex, day } = parseDate(payload.date);

        // Navigate calendar to correct month/year
        await navigateToMonth(year, monthIndex);

        // Click target day
        const target = document.querySelector<HTMLElement>(`[data-day="${payload.date}"] > button`);
        if (!target) return;
        target.click();
        await delay(500);

        // Dialog content for calendar entry
        const dialog = document.querySelector<HTMLElement>('[data-slot="dialog-content"]');
        if (!dialog) return;

        const todoInput = dialog.querySelector<HTMLInputElement>("input");
        const addBtn = todoInput?.parentElement?.querySelector<HTMLButtonElement>("button");
        if (!todoInput || !addBtn) return;

        // Fill input
        todoInput.focus();
        todoInput.setSelectionRange(0, todoInput.value.length);
        Object.defineProperty(todoInput, "value", {
            value: payload.calendarTodo,
            writable: true,
        });

        todoInput.dispatchEvent(new Event("input", { bubbles: true }));
        await delay(150);
        todoInput.dispatchEvent(new Event("change", { bubbles: true }));
        await delay(150);
        addBtn.click();
        await delay(150);
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        await delay(150);
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
        "How to use this app",
        "Create a todo: Buy grocery, do laundry, and clean room",
        "Note a science project work : Designing frontpage, write content, draw images",
        "Add an event on calendar : Brother's birthday, buy gift , 2025-09-05",
        "Save link: YouTube video | https://www.youtube.com/watch?v=dQw4w9WgXcQ | My Playlist",
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
                        {isLoading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <MessageCircle className="w-6 h-6" />
                        )}
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
                                        <ReactMarkdown>
                                            {m.content}
                                        </ReactMarkdown>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="self-start max-w-[85%] px-3 py-2 rounded-lg bg-muted flex items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Responding...</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Suggestions */}
                        {showSuggestions && (
                            <div className="flex flex-wrap gap-2 overflow-x-auto">
                                {suggestions.map((s, i) => (
                                    <div
                                        key={i}
                                        className="border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground px-2 py-1 md:px-3 md:py-2 text-xs rounded-full text-muted-foreground cursor-pointer transition-colors max-w-[120px] sm:max-w-[180px] md:max-w-full truncate"
                                        onClick={() => {
                                            setInput(s);
                                            setTimeout(() => {
                                                const inputEl = inputRowRef.current?.querySelector('input');
                                                (inputEl as HTMLInputElement | null)?.focus();
                                            }, 0);
                                        }}
                                        title={s}
                                    >
                                        {s}
                                    </div>
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
