"use client"
import { useState, useEffect } from "react";
import { Container } from "@/components/container";
import { StudentCourseCard } from "./StudentCourseCard";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/empty-state";
import { fetchApi } from "@/lib/api";
import { Notebook, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function Page() {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    fetchPublishedCourses();
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

  // Handle course enrollment
  const handleEnroll = async (courseId: string) => {
    // Will be implemented later
    console.log("Enrolling in course:", courseId);
  };

  return (
    <Container className="py-6 min-h-screen bg-background">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl">Explore Courses</h1>
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
            Try adjusting your search query to find more courses.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <StudentCourseCard
                key={course.id}
                course={course}
                onEnroll={handleEnroll}
              />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}