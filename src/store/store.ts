import { configureStore } from "@reduxjs/toolkit";
import quickyReducer from "./features/quickySlice";
import notezReducer from "./features/notezSlice";
import bookmarkReducer from "./features/bookmarkSlice";
import calendarTodosReducer from "./features/calendarTodosSlice";

export const store = configureStore({
  reducer: {
    quicky: quickyReducer,
    notez: notezReducer,
    bookmark: bookmarkReducer,
    calendarTodos: calendarTodosReducer,
  },
});

// Types for dispatch and state
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
