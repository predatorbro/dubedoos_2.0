"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Plus, Link, Settings, X } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setLinks as setBookmarkLinks } from "@/store/features/bookmarkSlice";


const LinkSaverModal = memo(() => {
    const Links = useSelector((state: RootState) => state.bookmark.links);
    const dispatch = useDispatch();

    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"add" | "manage">("add");

    // add-link form states
    const [label, setLabel] = useState("");
    const [url, setUrl] = useState("");
    const [favicon, setFavicon] = useState<string | null>(null);
    const [category, setCategory] = useState("");
    const [newCategory, setNewCategory] = useState("");
    const [urlError, setUrlError] = useState("");

    // Derive categories from Links using useMemo instead of local state
    const categories = useMemo(() => Links.map(link => link.category), [Links]);

    const [selectedCat, setSelectedCat] = useState("");

    // Refs for input navigation
    const labelRef = useRef<HTMLInputElement>(null);
    const urlRef = useRef<HTMLInputElement>(null);
    const newCategoryRef = useRef<HTMLInputElement>(null);
    const triggerButtonRef = useRef<HTMLButtonElement>(null);

    // URL validation function
    const isValidUrl = useCallback((string: string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }, []);

    // favicon fetcher with validation
    const fetchFavicon = useCallback((link: string) => {
        if (!link.trim()) return null;

        try {
            // Add protocol if missing
            let urlToCheck = link;
            if (!urlToCheck.startsWith('http://') && !urlToCheck.startsWith('https://')) {
                urlToCheck = 'https://' + urlToCheck;
            }

            const url = new URL(urlToCheck);
            return `https://www.google.com/s2/favicons?domain=${url.origin}&sz=128`;
        } catch {
            return null;
        }
    }, []);

    const handleUrlChange = useCallback((val: string) => {
        setUrl(val);

        // Live validation
        if (val.trim() && !isValidUrl(val.startsWith('http') ? val : 'https://' + val)) {
            setUrlError("Please enter a valid URL");
            setFavicon(null);
        } else {
            setUrlError("");
            const icon = fetchFavicon(val);
            setFavicon(icon);
        }
    }, [fetchFavicon, isValidUrl]);

    const handleSave = useCallback(() => {
        // Normalize URL: add https:// if missing
        let normalizedUrl = url;
        if (normalizedUrl && !normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
            normalizedUrl = 'https://' + normalizedUrl;
        }

        // Resolve category: prefer newCategory text, else selected category
        let finalCategory = newCategory ? newCategory : category;

        // Similarity matching: case-insensitive, space/punct-insensitive, partial containment
        const normalize = (s: string) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "").trim();
        const finalNorm = normalize(finalCategory);
        const similar = Links.find((c) => {
            const norm = normalize(c.category);
            if (!finalNorm || !norm) return false;
            return norm === finalNorm || norm.includes(finalNorm) || finalNorm.includes(norm);
        });

        if (similar) {
            // Use the canonical stored category label
            finalCategory = similar.category;
        }

        const existing = Links.find((c) => c.category === finalCategory);
        let updated: typeof Links;
        if (existing) {
            updated = Links.map(c => c.category === finalCategory
                ? { ...c, links: [...c.links, { label, url: normalizedUrl, favicon }] }
                : c
            );
        } else {
            updated = [
                ...Links,
                { category: finalCategory, links: [{ label, url: normalizedUrl, favicon }] },
            ];
        }
        dispatch(setBookmarkLinks(updated));

        // Reset
        setOpen(false);
        setLabel("");
        setUrl("");
        setFavicon(null);
        setCategory("");
        setNewCategory("");
    }, [Links, category, dispatch, favicon, label, newCategory, url]);

    const handleDeleteLink = useCallback((cat: string, linkIdx: number) => {
        const updated = Links.map((c) =>
            c.category === cat
                ? { ...c, links: c.links.filter((_, idx) => idx !== linkIdx) }
                : c
        );
        dispatch(setBookmarkLinks(updated));
    }, [Links, dispatch]);

    const handleDeleteCategory = useCallback((cat: string) => {
        const updated = Links.filter((c) => c.category !== cat);
        dispatch(setBookmarkLinks(updated));
        if (selectedCat === cat) setSelectedCat("");
    }, [Links, dispatch, selectedCat]);

    const handleLabelChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setLabel(e.target.value);
    }, []);

    const handleNewCategoryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setNewCategory(e.target.value);
    }, []);

    const handleModeChange = useCallback((newMode: "add" | "manage") => {
        setMode(newMode);
    }, []);

    const handleOpenChange = useCallback((newOpen: boolean) => {
        setOpen(newOpen);
    }, []);

    useEffect(() => {
        if (newCategory) {
            setCategory("");
            return;
        }
        if (category) {
            setNewCategory("");
            return;
        };
    }, [category, newCategory]);

    // Simple keyboard shortcut handler that toggles the modal
    const keyboardShortcutHandler = useMemo(() => {
        return (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'l' ||e.ctrlKey && e.key === 'L') {
                e.preventDefault();
                setOpen(prev => !prev);
            }

            if (e.key === 'Escape') {
                setOpen(false);
            }
        };
    }, []);

    // Keyboard shortcut effect
    useEffect(() => {
        document.addEventListener('keydown', keyboardShortcutHandler);
        return () => {
            document.removeEventListener('keydown', keyboardShortcutHandler);
        };
    }, [keyboardShortcutHandler]);

    // Auto-focus on first input when modal opens
    useEffect(() => {
        if (open && mode === "add") {
            // Small delay to ensure the modal is fully rendered
            const timer = setTimeout(() => {
                labelRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [open, mode]);

    return (
        <div className="flex items-center justify-center">
            {/* Trigger Button */}
            <Button
                ref={triggerButtonRef}
                variant="outline"
                onClick={() => setOpen(true)}
                className="w-full scale-90 h-12 flex items-center justify-center gap-2 bg-primary/5 hover:bg-primary/10 border-primary/20 hover:border-primary/30 transition-all duration-200"
            >
                <Plus className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Add / Manage Links</span>
            </Button>

            {/* Custom Modal */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                        onClick={() => setOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="sm:max-w-md w-full max-h-[calc(100%-2rem)] overflow-y-auto rounded-2xl shadow-xl bg-card border border-border scale-90 sm:scale-100"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setOpen(false)}
                                className="hover:bg-transparent absolute top-3 right-3 flex size-7 items-center justify-center rounded transition-colors z-10"
                            >
                                <X size={16} className="opacity-60 hover:opacity-100" />
                                <span className="sr-only">Close</span>
                            </Button>

                            {/* Header */}
                            <div className="p-6 pb-0">
                                <h2 className="text-xl font-semibold text-center text-foreground mb-2">
                                    {mode === "add" ? "Add Link" : "Manage Links"}
                                </h2>
                                <p className="text-sm text-muted-foreground text-center">
                                    {mode === "add"
                                        ? "Enter the URL and label for your link"
                                        : "Select a category to view and delete links"}
                                </p>
                            </div>

                            {/* Mode toggle */}
                            <div className="flex justify-center gap-2 my-4 px-6">
                                <Button
                                    size="sm"
                                    variant={mode === "add" ? "default" : "outline"}
                                    onClick={() => handleModeChange("add")}
                                >
                                    Add
                                </Button>
                                <Button
                                    size="sm"
                                    variant={mode === "manage" ? "default" : "outline"}
                                    onClick={() => handleModeChange("manage")}
                                >
                                    Manage
                                </Button>
                            </div>

                            {/* ADD LINK MODE */}
                            {mode === "add" && (
                                <div className="px-6 pb-6">
                                    {/* Preview Circle */}
                                    <div className="flex justify-center mb-3">
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                            className="w-20 h-20 object-contain rounded-full border border-border flex items-center justify-center bg-muted relative overflow-hidden"
                                        >
                                            {favicon ? (
                                                <Image
                                                    fill
                                                    src={favicon}
                                                    alt="favicon"
                                                    className="object-contain rounded-full"
                                                />
                                            ) : (
                                                <span className="text-2xl font-bold text-muted-foreground">
                                                    {label?.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </motion.div>
                                    </div>

                                    {/* Inputs */}
                                    <div className="grid gap-4">
                                        <Input
                                            id="link-label-input"
                                            ref={labelRef}
                                            placeholder="Label"
                                            value={label}
                                            onChange={handleLabelChange}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    urlRef.current?.focus();
                                                }
                                            }}
                                        />
                                        <div className="space-y-1">
                                            <Input
                                                ref={urlRef}
                                                placeholder="https://example.com"
                                                value={url}
                                                onChange={(e) => handleUrlChange(e.target.value)}
                                                className={urlError ? "border-destructive" : ""}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        newCategoryRef.current?.focus();
                                                    }
                                                }}
                                            />
                                            {urlError && (
                                                <p className="text-sm text-destructive">{urlError}</p>
                                            )}
                                        </div>

                                        {/* Category selection */}
                                        <div className="grid grid-cols-2 gap-2 items-center">
                                            <Select value={category} onValueChange={setCategory} defaultValue="" disabled={Boolean(newCategory)}>
                                                <SelectTrigger className="flex-1" disabled={categories.length === 0}>
                                                    <SelectValue placeholder={categories.length === 0 ? "No categories" : "Select Category"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((cat, idx) => (
                                                        <SelectItem key={idx} value={cat}>
                                                            {cat}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            <Input
                                                ref={newCategoryRef}
                                                placeholder="Add new category"
                                                value={newCategory}
                                                onChange={handleNewCategoryChange}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleSave();
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Save Button */}
                                    <div className="flex justify-end mt-6">
                                        <Button
                                            onClick={handleSave}
                                            disabled={!label || !url || (!category && !newCategory)}
                                        >
                                            Save
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* MANAGE MODE */}
                            {mode === "manage" && (
                                <div className="px-6 pb-6">
                                    <div className="grid gap-4">
                                        {/* Category Selector */}
                                        <Select value={selectedCat} onValueChange={setSelectedCat}>
                                            <SelectTrigger disabled={Boolean(categories.length === 0)}>
                                                <SelectValue placeholder={categories.length === 0 ? "No categories" : "Select Category"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat, idx) => (
                                                    <SelectItem key={idx} value={cat}>
                                                        {cat}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        {/* Links inside category */}
                                        {selectedCat && (
                                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                                {Links.find((c) => c.category === selectedCat)?.links.map(
                                                    (link, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center justify-between bg-muted rounded-md px-3 py-2 border border-border/50"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {link.favicon ? (
                                                                    <Image
                                                                        src={link.favicon}
                                                                        alt={link.label}
                                                                        width={20}
                                                                        height={20}
                                                                        className="rounded-sm"
                                                                    />
                                                                ) : (
                                                                    <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                                                        <span className="text-xs font-medium text-primary">
                                                                            {link.label.charAt(0).toUpperCase()}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <span className="text-sm text-foreground">{link.label}</span>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() =>
                                                                    handleDeleteLink(selectedCat, idx)
                                                                }
                                                            >
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}

                                        {/* Delete category */}
                                        {selectedCat && (
                                            <div className="flex justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDeleteCategory(selectedCat)}
                                                >
                                                    Delete Category
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

export default LinkSaverModal
