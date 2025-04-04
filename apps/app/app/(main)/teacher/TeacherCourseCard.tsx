"use client"
import { format } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Palette, Calendar, Clock, ImageIcon, ArrowRight, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { fetchApi } from "@/lib/api"


interface Artwork {
  id: string;
  title: string;
  description: string;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TeacherCourseCardProps {
  course: {
    id: string
    title: string
    description: string
    createdAt: string
    updatedAt: string
    artworksCount: number
    artworks: Artwork[]
    isPublished: boolean
  }
  onDelete?: (courseId: string) => void
}

export function TeacherCourseCard({ course, onDelete }: TeacherCourseCardProps) {
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const router = useRouter()

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const { error } = await fetchApi(`/api/course/${course.id}`, {
        method: 'DELETE',
        showSuccessToast: true,
        successTitle: "Course deleted",
        successMessage: "Course has been successfully deleted"
      });

      if (!error) {
        setShowDeleteDialog(false);
        router.refresh();
        onDelete?.(course.id);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    setIsLoading(true)
    if (course.artworks && course.artworks.length > 0) {
      // Find the first artwork with a valid coverImage
      const artworkWithCover = course.artworks.find(artwork => 
        artwork.coverImage && artwork.coverImage.trim().length > 0
      )
      
      if (artworkWithCover && artworkWithCover.coverImage) {
        setCoverImage(artworkWithCover.coverImage)
      } else {
        setCoverImage(null)
      }
    } else {
      setCoverImage(null)
    }
    setIsLoading(false)
  }, [course.artworks])

  return (
    <>
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <Card className="h-full overflow-hidden flex flex-col pt-0">
          <div className="w-full h-[200px] relative overflow-hidden">
            {isLoading ? (
              <div className="w-full h-full bg-muted animate-pulse" />
            ) : coverImage ? (
              <Image
                src={coverImage}
                alt={`Cover image for ${course.title}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
            )}
          </div>
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
          </CardContent>
          <CardFooter>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline"
                  size="icon"
                  className="text-destructive hover:cursor-pointer hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Button 
                className="hover:cursor-pointer" 
                onClick={() => router.push(`/teacher/${course.id}`)}
              >
                Edit course
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{course.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="hover:cursor-pointer"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="hover:cursor-pointer"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting course..." : "Delete course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}