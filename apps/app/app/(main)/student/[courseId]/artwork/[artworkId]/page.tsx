"use client"
import { use } from "react";
import { ArtworkViewer } from "./ArtworkViewer";
import { ArtworkSidebar } from "./ArtworkSidebar";
import { fetchApi } from "@/lib/api";
import { useEffect, useState } from "react";

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

async function getArtworks(courseId: string) {
  try {
    const response = await fetchApi<{ artworks: Artwork[] }>(
      `/api/artwork/course/${courseId}`,
      {
        showErrorToast: false,
        showSuccessToast: false,
      }
    )
    return response.data?.artworks || [];
  } catch (error) {
    console.error("Error fetching artworks:", error);
    return [];
  }
}

export default function ArtworkPage({ params }: {
  params: Promise<{
    artworkId: string;
    courseId: string;
  }>
}) {
  const { artworkId, courseId } = use(params);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArtworks = async () => {
      setIsLoading(true);
      const data = await getArtworks(courseId);
      setArtworks(data);
      setIsLoading(false);
    };
    fetchArtworks();
  }, [courseId]);

  // Create params objects for components
  const sidebarParams = {
    artworks,
    isLoading,
    courseId
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar takes up 1/3 of the screen width */}
      <div className="w-1/4 overflow-y-auto">
        <ArtworkSidebar params={sidebarParams} />
      </div>

      {/* Artwork viewer takes up 2/3 of the screen width */}
      <div className="w-3/4 overflow-y-auto p-6">
        <ArtworkViewer artworkId={artworkId} courseId={courseId} />
      </div>
    </div>
  );
}