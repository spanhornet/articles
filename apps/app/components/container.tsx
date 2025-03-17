import React from "react"

import { cn } from "@/lib/utils"

interface ContainerProps {
    children: React.ReactNode
    className?: string
}

export const Container = ({ children, className }: ContainerProps) => {
    return (
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
            <div className={cn("mx-auto max-w-3xl", className)}>{children}</div>
        </div>
    )
}