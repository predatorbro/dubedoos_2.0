import { createSlice, nanoid } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { act } from "react";

export interface Note {
  id: string;
  noteTitle: string;
  note: string;
  date: string;
  pinned: boolean;
  visibility: boolean;
  images: any[];
  deadLine: string | undefined;

}

export interface Section {
  sectionID: string;
  sectionTitle: string;
  sectionNotes: Note[];
}

interface NotezState {
  sections: Section[];
}

// Helper: safe localStorage load
const loadSections = (): Section[] | null => {
  if (typeof window !== "undefined") {
    try {
      const data = localStorage.getItem("sections");
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Failed to parse localStorage:", e);
    }
  }
  return null;
};

const initialState: NotezState = {
  sections: loadSections() || [

    {
      sectionID: nanoid(),
      sectionTitle: "Plan for next weekend",
      sectionNotes: [
        {
          id: nanoid(),
          noteTitle: "🌸 A little reminder",
          note: "Don’t forget to make space for joy ✨ — maybe a cozy walk, a sweet treat, or simply doing nothing guilt-free 💕",
          date: Date.now().toString(),
          pinned: false,
          visibility: true,
          images: [],
          deadLine: undefined
        },
      ],
    }

  ],
};

export const notezSlice = createSlice({
  name: "notez",
  initialState,
  reducers: {
    addNote: (state, action: PayloadAction<string>) => {
      const section = state.sections.find((s) => s.sectionID === action.payload);
      if (!section) return;

      section.sectionNotes.push({
        id: nanoid(),
        noteTitle: "",
        note: "",
        date: Date.now().toString(),
        pinned: false,
        visibility: true,
        images: [],
        deadLine: undefined

      });

      if (typeof window !== "undefined") {
        localStorage.setItem("sections", JSON.stringify(state.sections));
      }
    },

    editNote: (
      state,
      action: PayloadAction<{ id: string; sectionID: string; title: string; content: string }>
    ) => {
      const section = state.sections.find((s) => s.sectionID === action.payload.sectionID);
      const note = section?.sectionNotes.find((n) => n.id === action.payload.id);
      if (!note) return;

      note.noteTitle = action.payload.title;
      note.note = action.payload.content;

      if (typeof window !== "undefined") {
        localStorage.setItem("sections", JSON.stringify(state.sections));
      }
    },

    deleteNote: (state, action: PayloadAction<{ id: string; sectionID: string }>) => {
      const section = state.sections.find((s) => s.sectionID === action.payload.sectionID);
      if (!section) return;

      section.sectionNotes = section.sectionNotes.filter((n) => n.id !== action.payload.id);

      if (typeof window !== "undefined") {
        localStorage.setItem("sections", JSON.stringify(state.sections));
      }
    },

    togglePin: (state, action: PayloadAction<{ id: string; sectionID: string }>) => {
      const section = state.sections.find((s) => s.sectionID === action.payload.sectionID);
      const note = section?.sectionNotes.find((n) => n.id === action.payload.id);
      if (!note) return;

      note.pinned = !note.pinned;

      if (typeof window !== "undefined") {
        localStorage.setItem("sections", JSON.stringify(state.sections));
      }
    },

    toggleVisibility: (state, action: PayloadAction<{ id: string; sectionID: string; status: boolean }>) => {
      const section = state.sections.find((s) => s.sectionID === action.payload.sectionID);
      const note = section?.sectionNotes.find((n) => n.id === action.payload.id);
      if (!note) return;

      note.visibility = action.payload.status;

      if (typeof window !== "undefined") {
        localStorage.setItem("sections", JSON.stringify(state.sections));
      }
    },
    saveImages: (state, action: PayloadAction<{ sectionID: string; id: string; images: { secure_url: string }[] }>) => {
      const section = state.sections.find((s) => s.sectionID === action.payload.sectionID);
      if (!section) return;
      const note = section?.sectionNotes.find((n) => n.id === action.payload.id);
      if (!note) return;

      const newImages = action.payload.images;
      note.images = [...note.images, ...newImages];

      if (typeof window !== "undefined") {
        localStorage.setItem("sections", JSON.stringify(state.sections));
      }
    },
    deleteImage: (state, action: PayloadAction<{ id: string; sectionID: string; public_id: string; }>) => {
      const section = state.sections.find((s) => s.sectionID === action.payload.sectionID);
      if (!section) return;
      const note = section?.sectionNotes.find((n) => n.id === action.payload.id);
      if (!note) return;
      note.images = note.images.filter((image) => image.public_id !== action.payload.public_id);

      if (typeof window !== "undefined") {
        localStorage.setItem("sections", JSON.stringify(state.sections));
      }
    },
    setDeadLine: (state, action: PayloadAction<{ id: string; sectionID: string; deadLine: string | undefined }>) => {
      const section = state.sections.find((s) => s.sectionID === action.payload.sectionID);
      const note = section?.sectionNotes.find((n) => n.id === action.payload.id);
      if (!note) return;
      note.deadLine = action.payload.deadLine;

      if (typeof window !== "undefined") {
        localStorage.setItem("sections", JSON.stringify(state.sections));
      }
    },
    createSection: (state) => {
      state.sections.push({
        sectionID: nanoid(),
        sectionTitle: "New Section",
        sectionNotes: [{
          id: nanoid(),
          noteTitle: "",
          note: "",
          date: Date.now().toString(),
          pinned: false,
          visibility: true,
          images: [],
          deadLine: undefined

        }],
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("sections", JSON.stringify(state.sections));
      }
    },

    editSectionTitle: (state, action: PayloadAction<{ sectionID: string; title: string }>) => {
      const section = state.sections.find((s) => s.sectionID === action.payload.sectionID);
      if (!section) return;

      section.sectionTitle = action.payload.title;

      if (typeof window !== "undefined") {
        localStorage.setItem("sections", JSON.stringify(state.sections));
      }
    },

    deleteSection: (state, action: PayloadAction<string>) => {
      state.sections = state.sections.filter((s) => s.sectionID !== action.payload);

      if (typeof window !== "undefined") {
        localStorage.setItem("sections", JSON.stringify(state.sections));
      }
    },

    clearAllSections: (state) => {
      state.sections = [{
        sectionID: nanoid(),
        sectionTitle: "New Section",
        sectionNotes: [{
          id: nanoid(),
          noteTitle: "",
          note: "",
          date: Date.now().toString(),
          pinned: false,
          visibility: true,
          images: [],
          deadLine: undefined

        }],
      }];
      if (typeof window !== "undefined") {
        localStorage.setItem("sections", JSON.stringify(state.sections));
      }
    },



  },
});

export const {
  addNote,
  editNote,
  deleteNote,
  togglePin,
  toggleVisibility,
  saveImages,
  createSection,
  setDeadLine,
  editSectionTitle,
  deleteSection,
  clearAllSections,
  deleteImage
} = notezSlice.actions;

export default notezSlice.reducer;
