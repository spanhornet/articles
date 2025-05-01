import { use, useEffect, useState } from "react";

import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  useSidebar
} from "@/components/ui/sidebar";
import { ArtworkCard } from "./ArtworkCard";
import { Book, Palette, PanelLeftIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";

interface Artwork {
  id: string;
  title: string;
  description: string;
  author: string;
  thumbnailUrl?: string;
  coverImage?: string;
  order?: number;
  progress?: {
    isCompleted: boolean;
    completedAt: string | null;
    viewedAt: string | null;
  }
}

interface ArtworkProgress {
  artworkId: string;
  isCompleted: boolean;
  completedAt: string | null;
  viewedAt: string | null;
}

function SidebarToggleButton() {
  const { toggleSidebar, state } = useSidebar();

  if (state === "expanded") return null;

  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed left-4 top-4 z-50 h-8 w-8 rounded-full shadow-md"
      onClick={toggleSidebar}
    >
      <PanelLeftIcon className="h-4 w-4" />
      <span className="sr-only">Open Sidebar</span>
    </Button>
  );
}

export function ArtworkSidebar({
  params
}: {
  params: {
    artworks: Artwork[];
    isLoading?: boolean;
    courseId: string;
  }
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [progressData, setProgressData] = useState<Record<string, ArtworkProgress>>({});
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  const { artworks, isLoading, courseId } = params;

  // Get the current artwork ID from the URL path
  const pathSegments = pathname.split('/');
  const currentArtworkId = pathSegments[pathSegments.length - 1];

  // Fetch artwork progress from API
  useEffect(() => {
    const fetchArtworkProgress = async () => {
      if (!courseId) return;

      setIsLoadingProgress(true);
      try {
        const { data, error } = await fetchApi(`/api/progress/course/${courseId}`, {
          method: 'GET',
          showSuccessToast: true
        });

        if (data) {
          // Convert array to a map with artworkId as key for easy lookup
          const progressMap: Record<string, ArtworkProgress> = {};
          console.log("Progress data:", data);
          data.artworks.forEach((item: ArtworkProgress) => {
            progressMap[item.artworkId] = item;
          });
          setProgressData(progressMap);
        } else if (error) {
          console.error('Failed to fetch artwork progress:', error.message);
        }
      } catch (error) {
        console.error('Error fetching artwork progress:', error);
      } finally {
        setIsLoadingProgress(false);
      }
    };

    fetchArtworkProgress();
  }, [courseId]);

  // Process artworks with progress data from API
  const processedArtworks = artworks.map(artwork => {
    const art = { ...artwork };

    // Use progress data from API if available
    if (progressData[artwork.id]) {
      art.progress = progressData[artwork.id];
    } else {
      // Initialize progress if it doesn't exist
      if (!art.progress) {
        art.progress = {
          isCompleted: false,
          completedAt: null,
          viewedAt: null
        };
      }
    }

    return art;
  });

  // Sort artworks by order if available
  const sortedArtworks = [...processedArtworks].sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    return 0;
  });

  // Calculate progress stats
  const completedCount = sortedArtworks.filter(artwork => artwork.progress?.isCompleted).length;
  const inProgressCount = sortedArtworks.filter(artwork => !artwork.progress?.isCompleted && artwork.progress?.viewedAt).length;
  const progressPercentage = sortedArtworks.length > 0
    ? Math.round((completedCount / sortedArtworks.length) * 100)
    : 0;

  // Determine which artworks are accessible
  const getAccessibleArtworkIds = (): string[] => {
    if (sortedArtworks.length === 0) return [];

    const accessibleIds: string[] = [];

    // First artwork is always accessible
    if (sortedArtworks[0]) {
      accessibleIds.push(sortedArtworks[0].id);
    }

    // Find the furthest completed artwork
    let lastCompletedIndex = -1;
    for (let i = 0; i < sortedArtworks.length; i++) {
      if (sortedArtworks[i].progress?.isCompleted) {
        lastCompletedIndex = i;
        // Add all completed artworks
        if (!accessibleIds.includes(sortedArtworks[i].id)) {
          accessibleIds.push(sortedArtworks[i].id);
        }
      }
    }

    // Add the next artwork after the last completed one
    if (lastCompletedIndex !== -1 && lastCompletedIndex + 1 < sortedArtworks.length) {
      const nextArtworkId = sortedArtworks[lastCompletedIndex + 1].id;
      if (!accessibleIds.includes(nextArtworkId)) {
        accessibleIds.push(nextArtworkId);
      }
    }

    // Also add any "in progress" artworks
    for (const artwork of sortedArtworks) {
      if (!artwork.progress?.isCompleted && artwork.progress?.viewedAt) {
        if (!accessibleIds.includes(artwork.id)) {
          accessibleIds.push(artwork.id);
        }
      }
    }

    return accessibleIds;
  };

  const accessibleArtworkIds = getAccessibleArtworkIds();

  return (
    <SidebarProvider defaultOpen>
      <div className="flex">
        <Sidebar className="border-r p-0 w-1/4">
          <SidebarHeader className="p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-2">
                <h2 className="text-lg">Artworks</h2>
              </div>
              <SidebarTrigger />
            </div>

            {/* Progress indicator */}
            <div className="px-4 py-3 border-b pt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Course Progress</span>
                <span className="text-xs font-medium">{progressPercentage}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300 ease-in-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>{completedCount} completed</span>
                <span>{inProgressCount} in progress</span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-0">
            <SidebarGroup className="py-0">
              <SidebarGroupContent className="mt-2">
                <SidebarMenu>
                  {(isLoading || isLoadingProgress) ? (
                    // Loading skeletons
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="px-2 py-1">
                        <Skeleton className="h-[120px] w-full rounded-md" />
                      </div>
                    ))
                  ) : sortedArtworks.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                      No artworks found in this course
                    </div>
                  ) : (
                    <div className="space-y-2 p-2">
                      {sortedArtworks.map((artwork, index) => {
                        // Ensure artwork is accessible if it's completed or in the accessible list
                        const isAccessible = artwork.progress?.isCompleted || accessibleArtworkIds.includes(artwork.id);
                        const isViewed = Boolean(artwork.progress?.viewedAt);
                        // Mark the first artwork as "In Progress"
                        const isFirstArtwork = index === 0;

                        return (
                          <ArtworkCard
                            key={artwork.id}
                            id={artwork.id}
                            title={artwork.title}
                            description={artwork.description}
                            author={artwork.author}
                            thumbnailUrl={artwork.thumbnailUrl}
                            coverImage={artwork.coverImage}
                            progress={artwork.progress}
                            isCompleted={artwork.progress?.isCompleted || false}
                            isViewed={isViewed}
                            isSelected={artwork.id === currentArtworkId}
                            isDisabled={!isAccessible}
                            isNextInProgress={isFirstArtwork || (isAccessible && !artwork.progress?.isCompleted)}
                            onClick={() => {
                              if (isAccessible) {
                                router.push(`/student/${courseId}/artwork/${artwork.id}`);
                              }
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Toggle button that appears when sidebar is collapsed */}
        <SidebarToggleButton />
      </div>
    </SidebarProvider>
  );
} 