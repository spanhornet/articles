"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";
import { 
  ArrowLeftIcon, 
  CalendarPlusIcon, 
  CalendarSyncIcon,
  LoaderCircle 
} from "lucide-react";
import Link from "next/link";

// Define course type based on database schema
interface Course {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  teacherName: string;
  image?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Page() {
  // Use useParams to access route parameters
  const params = useParams();
  const courseId = params.courseId as string;
  const router = useRouter();
  
  // State for course data and loading status
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch course data when the component mounts
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetchApi(`/api/course/${courseId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch course: ${response.status}`);
        }
        
        const data = await response.json();
        setCourse(data);
      } catch (err) {
        console.error("Error fetching course:", err);
        setError(err instanceof Error ? err.message : "Failed to load course");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourse();
  }, [courseId]);
  
  // Format dates for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Loading state
  if (isLoading) {
    return (
      <Container>
        <div className="flex justify-center items-center py-20">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Container>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Container>
        <div className="py-6">
          <div className="border rounded-lg p-6 bg-destructive/10 text-destructive">
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p>{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => router.push('/teacher')}
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Return to dashboard
            </Button>
          </div>
        </div>
      </Container>
    );
  }
  
  return (
    <div>
      <Container>
        <div className="py-6 min-w-0 flex-1">
          <h2 className="text-2xl font-bold">
            {course?.title || "Untitled Course"}
          </h2>
          
          {/* Course metadata */}
          <div className="text-sm text-muted-foreground">
            {course?.createdAt && (
              <div className="mt-2 flex items-center gap-1.5">
                <CalendarPlusIcon className="h-4 w-4" />
                <span>Created on {formatDate(course.createdAt)}</span>
              </div>
            )}
            {course?.updatedAt && (
              <div className="mt-1 flex items-center gap-1.5">
                <CalendarSyncIcon className="h-4 w-4" />
                <span>Last updated on {formatDate(course.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Course editor interface */}
        <div className="border rounded-lg p-6 bg-card mb-6">
          <p className="text-center text-muted-foreground">
            This page is under construction. You will be able to edit your course content here.
          </p>
        </div>
      </Container>
    </div>
  );
}