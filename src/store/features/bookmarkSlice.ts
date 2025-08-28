import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export interface LinkItem {
    label: string;
    url: string;
    favicon: string | null;
}

export interface LinkCategory {
    category: string;
    links: LinkItem[];
}

export interface BookmarkState {
    links: LinkCategory[];
}

const LS_KEY = "Links";

function loadInitialLinks(): LinkCategory[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.localStorage.getItem(LS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed as LinkCategory[] : [];
    } catch {
        return [];
    }
}

const initialState: BookmarkState = {
    links: typeof window !== "undefined" ? loadInitialLinks() : [],
};

const bookmarkSlice = createSlice({
    name: "bookmark",
    initialState,
    reducers: {
        // Replace the entire links array and persist to localStorage
        setLinks(state, action: PayloadAction<LinkCategory[]>) {
            state.links = action.payload;
            try {
                if (typeof window !== "undefined") {
                    window.localStorage.setItem(LS_KEY, JSON.stringify(state.links));
                }
            } catch {
                // ignore persistence errors
            }
        },
    },
});

export const { setLinks } = bookmarkSlice.actions;
export default bookmarkSlice.reducer;

// Selector
export const selectBookmarkLinks = (state: RootState) => state.bookmark.links;


