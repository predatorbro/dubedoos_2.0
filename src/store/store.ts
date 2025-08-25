import { configureStore } from "@reduxjs/toolkit";
import quickyReducer from "./features/quickySlice";
import notezReducer from "./features/notezSlice"; 

export const store = configureStore({
  reducer: {
    quicky: quickyReducer,
    notez: notezReducer, 
  },
});

// Types for dispatch and state
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
