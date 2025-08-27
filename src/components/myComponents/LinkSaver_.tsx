"use client";

import { memo, useCallback, useMemo, useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export interface LinkItem {
    label: string;
    url: string;
    favicon: string | null;
}

export interface LinkCategory {
    category: string;
    links: LinkItem[];
}

const LinkSaverModal = memo(({
    setLinks,
    Links,
}: {
    setLinks: React.Dispatch<React.SetStateAction<LinkCategory[]>>;
    Links: LinkCategory[];
}) => {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"add" | "manage">("add");

    // add-link form states
    const [label, setLabel] = useState("");
    const [url, setUrl] = useState("");
    const [favicon, setFavicon] = useState<string | null>(null);
    const [category, setCategory] = useState("");
    const [newCategory, setNewCategory] = useState("");

    // derive categories from Links
    const categories = useMemo(() => Links.map(link => link.category), [Links]);

    const [selectedCat, setSelectedCat] = useState("");

    // favicon fetcher
    const fetchFavicon = useCallback((link: string) => {
        try {
            const domain = new URL(link).origin;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
        } catch {
            return null;
        }
    }, []);

    const handleUrlChange = useCallback((val: string) => {
        setUrl(val);
        const icon = fetchFavicon(val);
        setFavicon(icon);
    }, [fetchFavicon]);

    const handleSave = useCallback(() => {
        let finalCategory = category;
        if (newCategory) {
            finalCategory = newCategory;
        }

        setLinks((prev) => {
            const existing = prev.find((c) => c.category === finalCategory);
            if (existing) {
                const updated = prev.map(c => c.category === finalCategory
                    ? { ...c, links: [...c.links, { label, url, favicon }] }
                    : c
                );
                return updated;
            } else {
                return [
                    ...prev,
                    { category: finalCategory, links: [{ label, url, favicon }] },
                ];
            }
        });

        // Reset
        setOpen(false);
        setLabel("");
        setUrl("");
        setFavicon(null);
        setCategory("");
        setNewCategory("");
    }, [category, favicon, label, newCategory, setLinks, url]);

    const handleDeleteLink = useCallback((cat: string, linkIdx: number) => {
        setLinks((prev) =>
            prev.map((c) =>
                c.category === cat
                    ? { ...c, links: c.links.filter((_, idx) => idx !== linkIdx) }
                    : c
            )
        );
    }, [setLinks]);

    const handleDeleteCategory = useCallback((cat: string) => {
        setLinks((prev) => prev.filter((c) => c.category !== cat));
        if (selectedCat === cat) setSelectedCat("");
    }, [selectedCat, setLinks]);

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

    const previewCircle = useMemo(() => (
        <div className="flex justify-center mb-3">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-20 h-20 object-contain rounded-full border flex items-center justify-center bg-border relative overflow-hidden"
            >
                {favicon ? (
                    <Image
                        fill
                        src={favicon}
                        alt="favicon"
                        className="object-contain rounded-full"
                    />
                ) : (
                    <span className="text-2xl font-bold">
                        {label?.charAt(0).toUpperCase()}
                    </span>
                )}
            </motion.div>
        </div>
    ), [favicon, label]);

    const selectedLinks = useMemo(() => (
        Links.find((c) => c.category === selectedCat)?.links ?? []
    ), [Links, selectedCat]);

    return (
        <div className="flex items-center justify-center bg-muted">
            <Dialog open={open} onOpenChange={setOpen} >
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full h-full outline-none border-0 hover:bg-neutral-400/60 dark:hover:bg-neutral-700/80 rounded-none border-t m-0"
                    >
                        + Add / Manage Links
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md rounded-2xl shadow-xl bg-muted scale-90 sm:scale-100">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-center">
                            {mode === "add" ? "Add Link" : "Manage Links"}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground text-center">
                            {mode === "add"
                                ? "Enter the URL and label for your link"
                                : "Select a category to view and delete links"}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Mode toggle */}
                    <div className="flex justify-center gap-2 my-4">
                        <Button
                            size="sm"
                            variant={mode === "add" ? "default" : "outline"}
                            onClick={() => setMode("add")}
                        >
                            Add
                        </Button>
                        <Button
                            size="sm"
                            variant={mode === "manage" ? "default" : "outline"}
                            onClick={() => setMode("manage")}
                        >
                            Manage
                        </Button>
                    </div>

                    {/* ADD LINK MODE */}
                    {mode === "add" && (
                        <>
                            {/* Preview Circle */}
                            {previewCircle}

                            {/* Inputs */}
                            <div className="grid gap-4">
                                <Input
                                    placeholder="Label"
                                    value={label}
                                    onChange={(e) => setLabel(e.target.value)}
                                />
                                <Input
                                    placeholder="https://example.com"
                                    value={url}
                                    onChange={(e) => handleUrlChange(e.target.value)}
                                />

                                {/* Category selection */}
                                <div className="grid grid-cols-2 gap-2 items-center">

                                    <Select value={category} onValueChange={setCategory} defaultValue="" disabled={newCategory.length > 0}>
                                        <SelectTrigger className="flex-1 border rounded-md p-2 bg-accent" disabled={categories.length === 0}>

                                            <SelectValue placeholder={categories.length === 0 ? "No categories" : "Select Category"} />

                                        </SelectTrigger>
                                        <SelectContent className="bg-muted">
                                            {categories.map((cat, idx) => (
                                                <SelectItem
                                                    key={idx}
                                                    value={cat}
                                                    className="data-[highlighted]:bg-border"
                                                >
                                                    {cat}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Input
                                        placeholder="Add new category"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
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
                        </>
                    )}

                    {/* MANAGE MODE */}
                    {mode === "manage" && (
                        <div className="grid gap-4">
                            {/* Category Selector */}
                            <Select value={selectedCat} onValueChange={setSelectedCat}>
                                <SelectTrigger className="border rounded-md p-2 bg-accent" disabled={categories.length === 0}>
                                    <SelectValue placeholder={categories.length === 0 ? "No categories" : "Select Category"} />
                                </SelectTrigger>
                                <SelectContent className="bg-muted">
                                    {categories.map((cat, idx) => (
                                        <SelectItem
                                            key={idx}
                                            value={cat}
                                            className="data-[highlighted]:bg-border"
                                        >
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Links inside category */}
                            {selectedCat && (
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {selectedLinks.map((link, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between bg-border rounded-md px-3 py-2"
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
                                                    <span className="text-xs font-medium bg-border w-6 h-6 rounded-full flex items-center justify-center">
                                                        {link.label.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                                <span className="text-sm">{link.label}</span>
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
                                    ))}
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
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
})

export default memo(LinkSaverModal)
