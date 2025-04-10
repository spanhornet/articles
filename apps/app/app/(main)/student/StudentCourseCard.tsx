"use client"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ImageIcon, Users, Calendar } from "lucide-react"
import { format } from "date-fns"

interface Artwork {
  id: string;
  title: string;
  description: string;
  coverImage: string | null;
  createdAt: string;
}

interface Teacher {
  id: string;
  name: string;
}

interface StudentCourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    publishedAt: string;
    artworksCount: number;
    artworks: Artwork[];
    teacher: Teacher;
  };
  onEnroll: (courseId: string) => void;
}

export function StudentCourseCard({ course, onEnroll }: StudentCourseCardProps) {
  const coverImage = course.artworks.length > 0 ? course.artworks[0].coverImage : null;
  const formattedDate = course.publishedAt ? format(new Date(course.publishedAt), "MMM dd, yyyy") : "";

  return (
    <Card className="h-full overflow-hidden flex flex-col pt-0 hover:shadow-md transition-shadow duration-300">
      <div className="w-full h-[200px] relative overflow-hidden group">
        {coverImage ? (
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
      <CardContent className="flex-1">
        <Badge variant="secondary" className="mb-2">
          {course.artworksCount} {course.artworksCount === 1 ? 'artwork' : 'artworks'}
        </Badge>
        
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{course.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
        
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-4">
          <div className="flex items-center">
            <Users className="h-3 w-3 mr-2" />
            <span>{course.teacher.name}</span>
          </div>
          {formattedDate && (
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-2" />
              <span>Published {formattedDate}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-end">
        <Button 
          className="w-full hover:cursor-pointer hover:bg-primary/90 transition-colors"
          onClick={() => onEnroll(course.id)}
        >
          Enroll in this course
        </Button>
      </CardFooter>
    </Card>
  )
} 