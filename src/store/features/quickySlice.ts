import { createSlice, nanoid } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface Todo {
  id: string;
  todo: string;
  status: boolean;
}

interface QuickyState {
  quickees: Todo[];
}

// Helper to safely read from localStorage (only on client)
const loadFromLocalStorage = (): Todo[] | null => {
  if (typeof window !== "undefined") {
    try {
      const data = localStorage.getItem("quickees");
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Failed to parse localStorage:", e);
      return null;
    }
  }
  return null;
};

const initialState: QuickyState = {
  quickees: loadFromLocalStorage() || [
    { id: nanoid(), todo: "Hellow, am du-be-doos!! ‎ ‎ 😊✨", status: false },
    { id: nanoid(), todo: "but this time 2.0 with A.I. & 💖", status: false },
  ],
};

export const quickySlice = createSlice({
  name: "quicky",
  initialState,
  reducers: {
    addQuickees: (state, action: PayloadAction<string>) => {
      const tempTodo: Todo = {
        id: nanoid(),
        todo: action.payload,
        status: false,
      };
      state.quickees.push(tempTodo);

      if (typeof window !== "undefined") {
        localStorage.setItem("quickees", JSON.stringify(state.quickees));
      }
    },
    editQuickees: (
      state,
      action: PayloadAction<{ kee: string; text: string }>
    ) => {
      state.quickees = state.quickees.map((todo) =>
        todo.id === action.payload.kee
          ? { ...todo, todo: action.payload.text }
          : todo
      );
      console.log("edit quick triggered", action.payload.text);

      if (typeof window !== "undefined") {
        localStorage.setItem("quickees", JSON.stringify(state.quickees));
      }
    },
    deleteQuickees: (state, action: PayloadAction<string>) => {
      state.quickees = state.quickees.filter(
        (todo) => todo.id !== action.payload
      );

      if (typeof window !== "undefined") {
        localStorage.setItem("quickees", JSON.stringify(state.quickees));
      }
    },
    statusUpdate: (state, action: PayloadAction<string>) => {
      state.quickees = state.quickees.map((todo) =>
        todo.id === action.payload
          ? { ...todo, status: !todo.status }
          : todo
      );

      if (typeof window !== "undefined") {
        localStorage.setItem("quickees", JSON.stringify(state.quickees));
      }
    },

    clearAllQuickees: (state) => {
      state.quickees = [];
      if (typeof window !== "undefined") {
        localStorage.setItem("quickees", JSON.stringify(state.quickees));
      }
    },
  },
});

export const { addQuickees, deleteQuickees, statusUpdate, editQuickees, clearAllQuickees } =
  quickySlice.actions;

export default quickySlice.reducer;
