import React from 'react'

import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "du-be-doos | Workspace",
    description: "A modern todo app with a twist",
};

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            {children}
        </>
    )
}

export default layout