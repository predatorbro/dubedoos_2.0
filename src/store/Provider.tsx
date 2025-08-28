"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { memo } from "react";

export const Providers = memo(({ children }: { children: React.ReactNode }) => {
  return <Provider store={store}>{children}</Provider>;
});
