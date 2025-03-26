import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  className?: string;
  children: React.ReactNode;
}

export function Container({ className, children }: ContainerProps) {
  return (
    <div 
      className={cn(
        "container mx-auto px-4 sm:px-6 lg:px-8 border-x border-neutral-200 dark:border-neutral-800", 
        className
      )}
    >
      {children}
    </div>
  );
}