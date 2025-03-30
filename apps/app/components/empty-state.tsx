"use client"

import { cn } from "@/lib/utils"

export default function EmptyState({
  title,
  description,
  icon,
  onClick,
  className,
  cardClassName,
  iconClassName,
  titleClassName,
  descriptionClassName,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
  cardClassName?: string;
  iconClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  footer?: React.ReactNode;
}) {
  const handleClick = () => {
    onClick?.();
  }     

  return (
    <button
      onClick={handleClick}
      className={cn("w-full text-left bg-transparent border-0 p-0 cursor-pointer", className)}
    >
      <div className={cn(
        "bg-card text-card-foreground flex flex-col items-center justify-center rounded-xl border border-dashed py-12 transition-all hover:border-primary/50 hover:bg-muted/50 w-full",
        cardClassName
      )}>
        <div className={cn(
          "flex flex-col items-center justify-center px-6 text-center w-full",
        )}>
          <div className={cn("text-muted-foreground", iconClassName)}>
            {icon}
          </div>
          <div className={cn("text-lg leading-none font-semibold mt-4", titleClassName)}>{title}</div>
          <div className={cn("text-sm text-muted-foreground max-w-sm mt-3", descriptionClassName)}>{description}</div>
        </div>
      </div>
    </button>
  )
}

