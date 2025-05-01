"use client"

import React from "react"

// React Hooks
import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"

// UI Components
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Container } from "@/components/container"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { UserDropdown } from "@/app/(auth)/UserDropdown";

// Lucide Icons
import { PanelsTopLeft, Shapes, Notebook, NotebookPen, ArrowRight, Clock } from "lucide-react";
import { fetchApi } from "@/lib/api"

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

export default function Page({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);

  const [tab, setTab] = useState("tab-1")
  const [recentArtwork, setRecentArtwork] = useState<Artwork | null>(null)
  const [firstArtwork, setFirstArtwork] = useState<Artwork | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setIsLoading(true)
        const response = await fetchApi<{ artworks: Artwork[] }>(
          `/api/artwork/course/${courseId}`,
          {
            showErrorToast: false,
            showSuccessToast: false,
          }
        )

        console.log(response.data?.artworks)

        const artworks = response.data?.artworks || []

        // Find the first artwork based on order
        const orderedArtworks = [...artworks].sort((a, b) =>
          (a.order || Infinity) - (b.order || Infinity)
        )

        if (orderedArtworks.length > 0) {
          setFirstArtwork(orderedArtworks[0])
        }

        // Find the most recently viewed artwork
        const sorted = [...artworks]
          .filter(artwork => artwork.progress?.viewedAt)
          .sort((a, b) => {
            const dateA = a.progress?.viewedAt ? new Date(a.progress.viewedAt).getTime() : 0
            const dateB = b.progress?.viewedAt ? new Date(b.progress.viewedAt).getTime() : 0
            return dateB - dateA
          })

        if (sorted.length > 0) {
          setRecentArtwork(sorted[0])
        }
      } catch (error) {
        console.error("Error fetching artworks:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchArtworks()
  }, [courseId])

  const handleContinueLearning = () => {
    if (!firstArtwork) {
      throw new Error("No artworks in the course");
    }

    if (recentArtwork) {
      router.push(`/student/${courseId}/artwork/${recentArtwork.id}`)
    } else {
      router.push(`/student/${courseId}/artwork/${firstArtwork.id}`)
    }
  }

  return (
    <div>
      <header className="border-b">
        <Container className="py-6">
          <div className="flex items-center justify-between">
            <Link href="/student" className="text-xl font-medium">
              Articles
            </Link>
            <div className="flex items-center space-x-2">
              <ModeToggle />
              <UserDropdown />
            </div>
          </div>
        </Container>
      </header>

      <header className="border-b">
        <Container className="py-4">
          <div className="flex items-center justify-between">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/student" className="cursor-pointer">
                    <span className="flex items-center">
                      <Notebook size={16} className="text-muted-foreground mr-2" aria-hidden="true" />
                      <span className="text-muted-foreground">Student View</span>
                    </span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </Container>
      </header>
      <header className="border-b">
        <Container className="py-2">
          <Tabs defaultValue="tab-1" onValueChange={setTab}>
            <ScrollArea>
              <TabsList>
                <TabsTrigger
                  value="tab-1"
                >
                  <PanelsTopLeft
                    className="opacity-60"
                    size={16}
                    aria-hidden="true"
                  />
                  Catalog
                </TabsTrigger>
                <TabsTrigger
                  value="tab-2"
                >
                  <Shapes
                    className="opacity-60"
                    size={16}
                    aria-hidden="true"
                  />
                  Flashcards
                </TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </Tabs>
        </Container>
      </header>
      <main>
        <Container className="py-4">
          {tab === "tab-1" && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-medium">Catalog</h2>
              </div>
            </div>
          )}
          {tab === "tab-2" && (
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-medium">Flashcards</h2>
            </div>
          )}
        </Container>
        <Button
          onClick={handleContinueLearning}
          className="flex items-center gap-2"
        >
          <Clock size={16} />
          {recentArtwork ? "Continue Learning" : "Start Learning"}
          <ArrowRight size={16} />
        </Button>
      </main>
    </div>
  );
}
