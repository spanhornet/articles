"use client"

import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

interface TeacherCourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    coverImage: string | null;
    artworksCount: number;
  };
}

export function TeacherCourseCard({ course }: TeacherCourseCardProps) {
  return (
    <Link href={`/teacher/${course.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader className="p-0">
          <div className="relative aspect-video w-full">
            {course.coverImage ? (
              <Image
                src={course.coverImage}
                alt={course.title}
                fill
                className="object-cover rounded-t-lg"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center rounded-t-lg">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {course.description}
          </p>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">
              {course.artworksCount} {course.artworksCount === 1 ? 'artwork' : 'artworks'}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Created {format(new Date(course.createdAt), 'MMM d, yyyy')}</p>
            <p>Updated {format(new Date(course.updatedAt), 'MMM d, yyyy')}</p>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="w-full">
            <div className="text-sm text-primary font-medium">
              View course →
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
} 