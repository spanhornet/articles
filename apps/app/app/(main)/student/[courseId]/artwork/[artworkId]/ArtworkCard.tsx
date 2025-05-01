import Image from "next/image";
import { cn } from "@/lib/utils";
import { User, Lock } from "lucide-react";

interface ArtworkCardProps {
  id: string;
  title: string;
  description: string;
  author: string;
  thumbnailUrl?: string;
  coverImage?: string;
  progress?: {
    isCompleted: boolean;
    completedAt: string | null;
    viewedAt: string | null;
  };
  isCompleted?: boolean;
  isViewed?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  isNextInProgress?: boolean;
  onClick?: () => void;
}

export function ArtworkCard({
  id,
  title,
  description,
  author,
  thumbnailUrl,
  coverImage,
  progress,
  isCompleted = false,
  isViewed = false,
  isSelected = false,
  isDisabled = false,
  isNextInProgress = false,
  onClick,
}: ArtworkCardProps) {
  const imageUrl = thumbnailUrl || coverImage || "/placeholder-artwork.jpg";

  console.log("isCompleted:", isCompleted);
  console.log("progress?.isCompleted:", progress?.isCompleted);
  console.log("isNextInProgress:", isNextInProgress);

  // Determine the artwork status based on completion or next-in-progress state
  let status = "Not Started";
  let statusColor = "bg-red-500";
  let cardDisabled = isDisabled;

  if (isCompleted || progress?.isCompleted) {
    status = "Completed";
    statusColor = "bg-emerald-500";
    cardDisabled = false; // Completed artworks should never be disabled
  } else if (isNextInProgress) {
    status = "In Progress";
    statusColor = "bg-amber-500";
    cardDisabled = false; // The next artwork in progress should not be disabled
  } else if (isViewed) {
    // If it's been viewed but not completed, it's in progress
    status = "In Progress";
    statusColor = "bg-amber-500";
    cardDisabled = false;
  }

  return (
    <button
      className={cn(
        "group relative w-full overflow-hidden rounded-md border p-3 transition-all duration-200 ease-in-out text-left",
        "hover:bg-accent/50",
        isSelected && "bg-accent border-primary/30",
        cardDisabled ? "opacity-70 cursor-not-allowed border-muted" : "hover:shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
      disabled={cardDisabled}
      onClick={onClick}
    >
      <div className="flex gap-3">
        {/* Artwork thumbnail */}
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className={cn(
              "object-cover transition-transform duration-300",
              !cardDisabled && "group-hover:scale-105",
              cardDisabled && "grayscale-[50%]"
            )}
            sizes="64px"
          />
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Title with lock icon for disabled state */}
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-medium line-clamp-1 text-left">{title}</h3>
            {cardDisabled && <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
          </div>

          {/* Description */}
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 text-left">
            {description}
          </p>

          {/* Author and status row */}
          <div className="mt-2 flex items-center space-x-0">
            <div className="flex items-center gap-1 text-xs">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="truncate max-w-[100px]">{author}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs ml-4">
              <div className={cn("h-2 w-2 rounded-full", statusColor)} />
              <span>{status}</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
} 