"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { fetchApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Calendar, Link2, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Artwork {
  id: string;
  title: string;
  description: string;
  author: string;
  thumbnailUrl?: string;
  coverImage?: string;
  collocation?: string;
  link?: string;
  periodTags?: string[];
  typeTags?: string[];
  extraImages?: string[];
  order?: number;
  progress?: {
    isCompleted: boolean;
    completedAt: string | null;
    viewedAt: string | null;
  }
}

interface ArtworkViewerProps {
  artworkId: string;
  courseId: string;
}

export function ArtworkViewer({ artworkId, courseId }: ArtworkViewerProps) {
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allArtworks, setAllArtworks] = useState<Artwork[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const fetchArtworkData = async () => {
    if (!artworkId) return;

    setIsLoading(true);
    try {
      // Use the existing course endpoint which is available in the API
      const response = await fetchApi<{ artworks: Artwork[] }>(
        `/api/artwork/course/${courseId}`,
        {
          showErrorToast: false,
          showSuccessToast: false,
        }
      );

      // Get artwork progress - this is critical for showing completion status correctly
      const progressResponse = await fetchApi<{ progress: Record<string, { isCompleted: boolean, completedAt: string | null, viewedAt: string | null }> }>(
        `/api/progress/course/${courseId}`,
        {
          showErrorToast: false,
          showSuccessToast: false,
        }
      );

      // Find the specific artwork we want
      if (response.data?.artworks) {
        // Sort artworks by order
        const sortedArtworks = [...response.data.artworks].sort((a, b) => {
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
          }
          return 0;
        });

        // Merge artwork with progress data
        if (progressResponse.data?.progress) {
          const progressData = progressResponse.data.progress;

          // Apply progress to each artwork
          sortedArtworks.forEach(art => {
            // Check if there's progress data for this artwork
            if (progressData[art.id]) {
              art.progress = progressData[art.id];
            } else {
              // Initialize progress if it doesn't exist
              art.progress = {
                isCompleted: false,
                completedAt: null,
                viewedAt: null
              };
            }

            // Extra check: if description starts with "Completed" and no progress is set,
            // mark it as completed (fallback for artwork that should be marked as complete)
            if (art.description.toLowerCase().startsWith("completed") && !art.progress.isCompleted) {
              art.progress.isCompleted = true;
              art.progress.completedAt = art.progress.completedAt || new Date().toISOString();
            }
          });
        }

        setAllArtworks(sortedArtworks);
        const foundArtwork = sortedArtworks.find(art => art.id === artworkId);
        if (foundArtwork) {
          setArtwork(foundArtwork);

          // If this is the first time viewing and it's not completed, mark it as viewed
          if (foundArtwork && !foundArtwork.progress?.viewedAt) {
            try {
              await fetchApi(`/api/progress/${foundArtwork.id}/view`, {
                method: 'PUT',
                showErrorToast: false,
                showSuccessToast: false,
              });

              // Update local state to reflect the view
              if (foundArtwork.progress) {
                foundArtwork.progress.viewedAt = new Date().toISOString();
              }
            } catch (error) {
              console.error("Error marking artwork as viewed:", error);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching artwork details:", error);
      // For demonstration purposes, let's create a dummy artwork
      // In a real app, this would be handled differently
      setArtwork({
        id: artworkId,
        title: "Artwork Title",
        description: "This is a detailed description of the artwork. It would typically include information about the artistic style, historical context, and significance of the piece.",
        author: "Famous Artist",
        coverImage: "/placeholder-artwork.jpg",
        periodTags: ["Renaissance", "16th Century"],
        typeTags: ["Painting", "Oil on Canvas"],
        collocation: "Famous Museum, City",
        link: "https://example.com/artwork-details"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworkData();
  }, [artworkId, courseId]);

  const navigateToArtwork = (id: string) => {
    router.push(`/student/${courseId}/artwork/${id}`);
  };

  const getPreviousArtwork = () => {
    if (!artwork || allArtworks.length === 0) return null;
    const currentIndex = allArtworks.findIndex(art => art.id === artworkId);
    if (currentIndex <= 0) return null;
    return allArtworks[currentIndex - 1];
  };

  const getNextArtwork = () => {
    if (!artwork || allArtworks.length === 0) return null;
    const currentIndex = allArtworks.findIndex(art => art.id === artworkId);
    if (currentIndex === -1 || currentIndex >= allArtworks.length - 1) return null;
    return allArtworks[currentIndex + 1];
  };

  const markAsComplete = async () => {
    if (!artwork || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await fetchApi(`/api/progress/${artwork.id}/complete`, {
        method: 'PUT',
        showErrorToast: true,
        showSuccessToast: true,
        successMessage: "Marked as complete!",
      });

      // Update local state
      setArtwork(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          progress: {
            isCompleted: true,
            completedAt: new Date().toISOString(),
            viewedAt: prev.progress?.viewedAt || new Date().toISOString()
          }
        };
      });

      // Also update in the allArtworks array
      setAllArtworks(prev => {
        return prev.map(art => {
          if (art.id === artworkId) {
            return {
              ...art,
              progress: {
                isCompleted: true,
                completedAt: new Date().toISOString(),
                viewedAt: art.progress?.viewedAt || new Date().toISOString()
              }
            };
          }
          return art;
        });
      });

      // Refresh artwork data to ensure all progress states are updated
      await fetchArtworkData();

      // Navigate to the next artwork if available
      const nextArt = getNextArtwork();
      if (nextArt) {
        navigateToArtwork(nextArt.id);
      }
    } catch (error) {
      console.error("Error marking artwork as complete:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isNextArtworkAvailable = () => {
    const nextArtwork = getNextArtwork();
    if (!nextArtwork) return false;

    // All artworks must be completed before proceeding to the next
    return artwork?.progress?.isCompleted === true;
  };

  const previousArtwork = getPreviousArtwork();
  const nextArtwork = getNextArtwork();
  const canAccessNext = isNextArtworkAvailable();

  if (!artwork) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Select an artwork to view details</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{artwork.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{artwork.author}</span>
          </div>
          {artwork.collocation && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{artwork.collocation}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main artwork image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border">
        <Image
          src={artwork.coverImage || "/placeholder-artwork.jpg"}
          alt={artwork.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Tags */}
      {((artwork.periodTags && artwork.periodTags.length > 0) ||
        (artwork.typeTags && artwork.typeTags.length > 0)) && (
          <div className="flex flex-wrap gap-2">
            {artwork.periodTags?.map((tag) => (
              <span key={tag} className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                {tag}
              </span>
            ))}
            {artwork.typeTags?.map((tag) => (
              <span key={tag} className="rounded-full bg-secondary/10 px-3 py-1 text-xs text-secondary">
                {tag}
              </span>
            ))}
          </div>
        )}

      {/* Description */}
      <div className="prose prose-sm max-w-none">
        <p>{artwork.description}</p>
      </div>

      {/* External link */}
      {artwork.link && (
        <div className="flex items-center gap-2 text-sm text-primary">
          <Link2 className="h-4 w-4" />
          <a href={artwork.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
            Learn more about this artwork
          </a>
        </div>
      )}

      {/* Additional images if available */}
      {artwork.extraImages && artwork.extraImages.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-medium">Additional Views</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {artwork.extraImages.map((image, index) => (
              <div key={index} className="relative aspect-square overflow-hidden rounded-md border">
                <Image
                  src={image}
                  alt={`${artwork.title} - view ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => previousArtwork && navigateToArtwork(previousArtwork.id)}
            disabled={!previousArtwork}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => nextArtwork && navigateToArtwork(nextArtwork.id)}
            disabled={!nextArtwork || !canAccessNext}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant={artwork.progress?.isCompleted ? "outline" : "default"}
          size="sm"
          className="flex items-center gap-2"
          onClick={markAsComplete}
          disabled={artwork.progress?.isCompleted || isSubmitting}
        >
          {artwork.progress?.isCompleted ? (
            <>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              Completed
            </>
          ) : isSubmitting ? (
            "Saving..."
          ) : (
            "Mark as complete"
          )}
        </Button>
      </div>
    </div>
  );
} 