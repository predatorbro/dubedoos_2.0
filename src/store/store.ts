import { configureStore } from "@reduxjs/toolkit";
import quickyReducer from "./features/quickySlice";
import notezReducer from "./features/notezSlice";
import bookmarkReducer from "./features/bookmarkSlice";
import calendarTodosReducer from "./features/calendarTodosSlice";
import stickyNotesReducer from "./features/stickyNotesSlice";
import streakCalendarReducer from "./features/streakCalendarSlice";
import passwordManagerReducer from "./features/passwordManagerSlice";

export const store = configureStore({
  reducer: {
    quicky: quickyReducer,
    notez: notezReducer,
    bookmark: bookmarkReducer,
    calendarTodos: calendarTodosReducer,
    stickyNotes: stickyNotesReducer,
    streakCalendar: streakCalendarReducer,
    passwordManager: passwordManagerReducer,
  },
});

// Types for dispatch and state
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
