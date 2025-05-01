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
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { UserDropdown } from "@/app/(auth)/UserDropdown";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";

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
        // Filter to only include enrollments where the course is published
        const publishedEnrollments = (data.enrollments || []).filter(
          (enrollment: Enrollment) => enrollment.course.publishedAt !== null
        );
        setEnrolledCourses(publishedEnrollments);
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
  const filteredCourses = courses.filter((course) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      course.title.toLowerCase().includes(searchTerm) ||
      course.description.toLowerCase().includes(searchTerm) ||
      course.teacher.name.toLowerCase().includes(searchTerm)
    );
  });

  // Format enrolled courses to match course structure
  const formattedEnrolledCourses = enrolledCourses.map(enrollment => {
    return {
      ...enrollment.course,
      teacher: enrollment.teacher,
      artworks: enrollment.artwork ? [enrollment.artwork] : [],
      enrollmentId: enrollment.id,
      progress: enrollment.progress,
      completedAt: enrollment.completedAt,
      isEnrolled: true
    };
  });

  // Filter enrolled courses based on search query
  const filteredEnrolledCourses = formattedEnrolledCourses.filter((course) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      course.title.toLowerCase().includes(searchTerm) ||
      course.description.toLowerCase().includes(searchTerm) ||
      course.teacher.name.toLowerCase().includes(searchTerm)
    );
  });

  // Filter out courses that the user is already enrolled in
  const availableCourses = filteredCourses.filter(course =>
    !enrolledCourses.some(enrollment => enrollment.courseId === course.id)
  ).map(course => ({
    ...course,
    isEnrolled: false
  }));

  // Combine the filtered enrolled courses with available courses
  const allCourses = [...filteredEnrolledCourses, ...availableCourses];

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

  const isLoaded = !isLoading && !isLoadingEnrollments;

  return (
    <>
      {/* Main header from layout.tsx */}
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

      {/* Secondary header with breadcrumb */}
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

      <Container className="py-6 min-h-screen bg-background">
        <div className="flex flex-col space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl flex items-center">
                Courses
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

            {!isLoaded ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-video bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : allCourses.length === 0 ? (
              <EmptyState
                icon={<BookOpen className="h-8 w-8" />}
                title="No courses found"
                description={searchQuery ? "No courses match your search query." : "No courses available at the moment."}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {allCourses.map((course) => (
                  <StudentCourseCard
                    key={course.isEnrolled ? `enrolled-${course.id}` : course.id}
                    course={course}
                    enrollment={course.isEnrolled ? {
                      id: course.enrollmentId,
                      progress: course.progress,
                      completedAt: course.completedAt
                    } : undefined}
                    onEnroll={handleEnroll}
                    onStudy={handleStudy}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>

      {/* Footer from layout.tsx */}
      <footer className="border-t bg-background mt-auto">
        <Container className="py-6">
          <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2025 Articles. All rights reserved.
            </div>
            <nav>
              <ul className="flex flex-wrap gap-6 text-sm">
                <li>
                  <Link
                    href="/terms"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookies"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </Container>
      </footer>
    </>
  );
}