"use client"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ImageIcon, Users, Calendar, BookOpen, CheckCircle2, Award, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"
import { Progress } from "@/components/ui/progress"

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

interface Enrollment {
  id: string;
  progress: number;
  completedAt: string | null;
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
  enrollment?: Enrollment;
  onEnroll: (courseId: string) => void;
  onStudy?: (courseId: string) => void;
}

export function StudentCourseCard({ course, enrollment, onEnroll, onStudy }: StudentCourseCardProps) {
  const coverImage = course.artworks.length > 0 ? course.artworks[0].coverImage : null;
  const formattedDate = course.publishedAt ? format(new Date(course.publishedAt), "MMM dd, yyyy") : "";
  const [isEnrolling, setIsEnrolling] = useState(false);
  const isEnrolled = !!enrollment;
  const progress = enrollment?.progress || 0;
  const isCompleted = enrollment?.completedAt !== null;

  const handleEnroll = async () => {
    setIsEnrolling(true);
    await onEnroll(course.id);
    setIsEnrolling(false);
  };

  const handleStudy = () => {
    if (onStudy) {
      onStudy(course.id);
    }
  };

  return (
    <Card className="h-full overflow-hidden flex flex-col pt-0">
      <div className="relative">
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
        
        {isEnrolled && (
          <div className="w-full absolute -bottom-1">
            <Progress value={progress} className="h-1.5 rounded-none" />
          </div>
        )}
      </div>

      <CardContent className="flex-1">
        <div className="flex justify-between items-start">
          {!isEnrolled && (
            <Badge variant="secondary" className="mb-4">
              {course.artworksCount} {course.artworksCount === 1 ? 'artwork' : 'artworks'}
            </Badge>
          )}
          
          {isEnrolled && progress > 0 && (
            <Badge variant={isCompleted ? "default" : "outline"} className="ml-2">
              {isCompleted ? (
                <span className="flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
                </span>
              ) : (
                <span>{progress}% Complete</span>
              )}
            </Badge>
          )}
        </div>
        
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{course.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
      </CardContent>

      <CardFooter>
        {isEnrolled ? (
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center text-sm text-muted-foreground">
              <Award className="h-4 w-4 mr-1.5" />
              <span>{progress}% Completed</span>
            </div>
            <Button 
              variant="default" 
              className="gap-1 cursor-pointer"
              onClick={handleStudy}
            >
              Study course <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        ) : (
          <Button 
            className="w-full hover:cursor-pointer hover:bg-primary/90 transition-colors"
            onClick={handleEnroll}
            disabled={isEnrolling}
          >
            {isEnrolling ? "Enrolling..." : "Enroll in this course"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
} 