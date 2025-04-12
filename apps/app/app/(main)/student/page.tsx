"use client"
import { useState, useEffect } from "react";
import { Container } from "@/components/container";
import { StudentCourseCard } from "./StudentCourseCard";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/empty-state";
import { fetchApi } from "@/lib/api";
import { Notebook, Search, GraduationCap, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface Enrollment {
  id: string;
  courseId: string;
  progress: number;
  completedAt: string | null;
  course: {
    id: string;
    title: string;
    description: string;
    publishedAt: string;
  };
  teacher: {
    id: string;
    name: string;
  };
  artwork: {
    id: string;
    title: string;
    description: string;
    coverImage: string | null;
    createdAt: string;
  } | null;
}

export default function Page() {
  const [courses, setCourses] = useState<any[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Fetch all published courses
  const fetchPublishedCourses = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await fetchApi("/api/course/published", {
        showErrorToast: false,
        showSuccessToast: false,
      });

      if (data && !error) {
        setCourses(data.courses || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch enrolled courses
  const fetchEnrolledCourses = async () => {
    setIsLoadingEnrollments(true);
    try {
      const { data, error } = await fetchApi("/api/enrollment", {
        showErrorToast: false,
        showSuccessToast: false,
      });

      if (data && !error) {
        setEnrolledCourses(data.enrollments || []);
      }
    } finally {
      setIsLoadingEnrollments(false);
    }
  };

  useEffect(() => {
    fetchPublishedCourses();
    fetchEnrolledCourses();
  }, []);

  // Filter courses based on search query
  const filteredCourses = courses
    // Filter out courses that the user is already enrolled in
    .filter(course => !enrolledCourses.some(enrollment => enrollment.courseId === course.id))
    // Filter based on search query
    .filter((course) => {
      const searchTerm = searchQuery.toLowerCase();
      return (
        course.title.toLowerCase().includes(searchTerm) ||
        course.description.toLowerCase().includes(searchTerm) ||
        course.teacher.name.toLowerCase().includes(searchTerm)
      );
    });

  // Handle course enrollment
  const handleEnroll = async (courseId: string) => {
    try {
      const { data, error } = await fetchApi("/api/enrollment", {
        method: "POST",
        body: JSON.stringify({ courseId }),
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (data && !error) {
        // Refresh the courses list to show updated enrollment status
        fetchPublishedCourses();
        fetchEnrolledCourses();
      }
    } catch (error) {
      console.error("Error enrolling in course:", error);
    }
  };

  // Handle navigating to study a course
  const handleStudy = (courseId: string) => {
    router.push(`/student/${courseId}`);
  };

  // Create a mapping of course IDs to enrollment data for enrolled courses
  const enrollmentMap = enrolledCourses.reduce((map, enrollment) => {
    map[enrollment.courseId] = {
      id: enrollment.id,
      progress: enrollment.progress, 
      completedAt: enrollment.completedAt
    };
    return map;
  }, {} as Record<string, { id: string; progress: number; completedAt: string | null }>);

  return (
    <Container className="py-6 min-h-screen bg-background">
      <div className="flex flex-col space-y-6">
        {/* Enrolled Courses Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl flex items-center">
              Enrolled Courses
            </h1>
          </div>

          {isLoadingEnrollments ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="aspect-video bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : enrolledCourses.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="h-8 w-8" />}
              title="No enrolled courses"
              description="You haven't enrolled in any courses yet. Explore the available courses below."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 mb-8">
              {enrolledCourses.map((enrollment) => {
                // Format enrollment data to match the expected course structure
                const courseData = {
                  id: enrollment.course.id,
                  title: enrollment.course.title,
                  description: enrollment.course.description,
                  publishedAt: enrollment.course.publishedAt,
                  artworksCount: 0, // This will be updated if we add artwork count to the API
                  teacher: enrollment.teacher,
                  artworks: enrollment.artwork ? [enrollment.artwork] : []
                };
                
                return (
                  <StudentCourseCard
                    key={enrollment.id}
                    course={courseData}
                    enrollment={{
                      id: enrollment.id,
                      progress: enrollment.progress,
                      completedAt: enrollment.completedAt
                    }}
                    onEnroll={handleEnroll}
                    onStudy={handleStudy}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Explore Courses Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl flex items-center">
              Explore Courses
            </h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Search courses..."
                className="pl-9 md:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-video bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <p className="text-muted-foreground">
              {searchQuery ? "No courses match your search query." : "No courses available at the moment."}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <StudentCourseCard
                  key={course.id}
                  course={course}
                  onEnroll={handleEnroll}
                  onStudy={handleStudy}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}