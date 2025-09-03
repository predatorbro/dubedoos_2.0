"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
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

    // Derive categories from Links using useMemo instead of local state
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
                ? { ...c, links: [...c.links, { label, url, favicon }] }
                : c
            );
        } else {
            updated = [
                ...Links,
                { category: finalCategory, links: [{ label, url, favicon }] },
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

    return (
        <div className="flex items-center justify-center">
            <Dialog open={open} onOpenChange={handleOpenChange} >
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full h-full outline-none border-0 hover:bg-accent rounded-none border-t m-0 transition-colors"
                    >
                        + Add / Manage Links
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md rounded-2xl shadow-xl bg-card border border-border scale-90 sm:scale-100">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-center text-foreground">
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
                        <>
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
                                    placeholder="Label"
                                    value={label}
                                    onChange={handleLabelChange}
                                />
                                <Input
                                    placeholder="https://example.com"
                                    value={url}
                                    onChange={(e) => handleUrlChange(e.target.value)}
                                />

                                {/* Category selection */}
                                <div className="grid grid-cols-2 gap-2 items-center">

                                    <Select value={category} onValueChange={setCategory} defaultValue="" disabled={newCategory.length > 0}>
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
                                        placeholder="Add new category"
                                        value={newCategory}
                                        onChange={handleNewCategoryChange}
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
                                <SelectTrigger disabled={categories.length === 0}>
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
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
});

export default LinkSaverModal
