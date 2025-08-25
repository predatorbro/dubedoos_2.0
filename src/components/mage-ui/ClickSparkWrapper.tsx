"use client";

import ClickSpark from "components/mage-ui/cursor-effects/click-spark";

import { useTheme } from "next-themes";
export function ClickSparkWrapper({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme(); 
    return (
        <ClickSpark
            sparkColor={theme === "dark" ? "oklch(0.98 0 0)" : "#f97316"}
        >
            {children}
        </ClickSpark>
    );
}
