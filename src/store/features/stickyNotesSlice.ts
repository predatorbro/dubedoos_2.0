import { createSlice, nanoid } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface StickyNote {
  id: string;
  title: string;
  content: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface StickyNotesState {
  stickyNotes: StickyNote[];
}

// Helper to safely read from localStorage (only on client)
const loadFromLocalStorage = (): StickyNote[] | null => {
  if (typeof window !== "undefined") {
    try {
      const data = localStorage.getItem("stickyNotes");
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Failed to parse localStorage:", e);
      return null;
    }
  }
  return null;
};

const initialState: StickyNotesState = {
  stickyNotes: loadFromLocalStorage() || [],
};

export const stickyNotesSlice = createSlice({
  name: "stickyNotes",
  initialState,
  reducers: {
    addStickyNote: (state, action: PayloadAction<{ title: string; content: string; color?: string }>) => {
      const now = new Date().toISOString();
      const stickyNote: StickyNote = {
        id: nanoid(),
        title: action.payload.title,
        content: action.payload.content,
        color: action.payload.color || "yellow",
        createdAt: now,
        updatedAt: now,
      };
      state.stickyNotes.push(stickyNote);

      if (typeof window !== "undefined") {
        localStorage.setItem("stickyNotes", JSON.stringify(state.stickyNotes));
      }
    },
    updateStickyNote: (state, action: PayloadAction<{ id: string; title?: string; content?: string; color?: string }>) => {
      const stickyNote = state.stickyNotes.find(note => note.id === action.payload.id);
      if (!stickyNote) return;

      if (action.payload.title !== undefined) stickyNote.title = action.payload.title;
      if (action.payload.content !== undefined) stickyNote.content = action.payload.content;
      if (action.payload.color !== undefined) stickyNote.color = action.payload.color;
      
      stickyNote.updatedAt = new Date().toISOString();

      if (typeof window !== "undefined") {
        localStorage.setItem("stickyNotes", JSON.stringify(state.stickyNotes));
      }
    },
    deleteStickyNote: (state, action: PayloadAction<string>) => {
      state.stickyNotes = state.stickyNotes.filter(
        (note) => note.id !== action.payload
      );

      if (typeof window !== "undefined") {
        localStorage.setItem("stickyNotes", JSON.stringify(state.stickyNotes));
      }
    },
    clearAllStickyNotes: (state) => {
      state.stickyNotes = [];
      if (typeof window !== "undefined") {
        localStorage.setItem("stickyNotes", "[]");
      }
    },
  },
});

export const {
  addStickyNote,
  updateStickyNote,
  deleteStickyNote,
  clearAllStickyNotes
} = stickyNotesSlice.actions;

export default stickyNotesSlice.reducer;

// Selectors
export const selectStickyNotes = (state: { stickyNotes: StickyNotesState }) => state.stickyNotes.stickyNotes;
