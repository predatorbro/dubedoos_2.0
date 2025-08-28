import { configureStore } from "@reduxjs/toolkit";
import quickyReducer from "./features/quickySlice";
import notezReducer from "./features/notezSlice"; 
import bookmarkReducer from "./features/bookmarkSlice";

export const store = configureStore({
  reducer: {
    quicky: quickyReducer,
    notez: notezReducer, 
    bookmark: bookmarkReducer,
  },
});

// Types for dispatch and state
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
