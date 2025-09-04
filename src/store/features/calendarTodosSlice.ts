import { createSlice, nanoid, createSelector } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface CalendarTodo {
  id: string;
  todo: string;
  status: boolean;
  date: string; // ISO date string for the specific date
  calendarId: string; // Reference to the streak calendar
}

export interface CalendarTodosState {
  calendarTodos: CalendarTodo[];
}

// Helper to safely read from localStorage (only on client)
const loadFromLocalStorage = (): CalendarTodo[] | null => {
  if (typeof window !== "undefined") {
    try {
      const data = localStorage.getItem("calendarTodos");
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Failed to parse localStorage:", e);
      return null;
    }
  }
  return null;
};

const initialState: CalendarTodosState = {
  calendarTodos: loadFromLocalStorage() || [],
};

export const calendarTodosSlice = createSlice({
  name: "calendarTodos",
  initialState,
  reducers: {
    addCalendarTodo: (state, action: PayloadAction<{ todo: string; date: string; calendarId: string }>) => {
      const tempTodo: CalendarTodo = {
        id: nanoid(),
        todo: action.payload.todo,
        status: false,
        date: action.payload.date,
        calendarId: action.payload.calendarId,
      };
      state.calendarTodos.push(tempTodo);

      if (typeof window !== "undefined") {
        localStorage.setItem("calendarTodos", JSON.stringify(state.calendarTodos));
      }
    },
    deleteCalendarTodo: (state, action: PayloadAction<string>) => {
      state.calendarTodos = state.calendarTodos.filter(
        (todo) => todo.id !== action.payload
      );

      if (typeof window !== "undefined") {
        localStorage.setItem("calendarTodos", JSON.stringify(state.calendarTodos));
      }
    },
    toggleCalendarTodoStatus: (state, action: PayloadAction<string>) => {
      state.calendarTodos = state.calendarTodos.map((todo) =>
        todo.id === action.payload
          ? { ...todo, status: !todo.status }
          : todo
      );

      if (typeof window !== "undefined") {
        localStorage.setItem("calendarTodos", JSON.stringify(state.calendarTodos));
      }
    },
    clearAllCalendarTodos: (state) => {
      state.calendarTodos = [];
      if (typeof window !== "undefined") {
        localStorage.setItem("calendarTodos", "[]");
      }
    },
  },
});

export const {
  addCalendarTodo,
  deleteCalendarTodo,
  toggleCalendarTodoStatus,
  clearAllCalendarTodos
} = calendarTodosSlice.actions;

export default calendarTodosSlice.reducer;

// Selectors
export const selectCalendarTodos = (state: { calendarTodos: CalendarTodosState }) => state.calendarTodos.calendarTodos;

// Memoized selector for todos by date
export const selectTodosForDate = createSelector(
  [
    (state: { calendarTodos: CalendarTodosState }) => state.calendarTodos.calendarTodos,
    (_state: { calendarTodos: CalendarTodosState }, date: string) => date
  ],
  (todos, date) => todos.filter(todo => todo.date === date)
);
