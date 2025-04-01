"use client"

// React Hooks
import { useDialog } from "@/hooks/useDialog";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Shadcn UI
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// API
import { fetchApi } from "@/lib/api";

// Lucide Icons
import { 
  NotebookPen,
  Plus
} from "lucide-react";

// Components
import { CourseForm } from "./CourseForm";
import { TeacherCourseCard } from "./TeacherCourseCard";

interface Artwork {
  id: string;
  title: string;
  description: string;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  coverImage: string | null;
  artworksCount: number;
  artworks: Artwork[];
}

export default function Page() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { isOpen, onOpen, onClose } = useDialog();
  
  const onSubmit = async (values: { title: string; description: string }) => {
    const { data, error} = await fetchApi("/api/course", {
      method: "POST",
      body: JSON.stringify(values),
      showSuccessToast: true,
      successTitle: "Course Created",
      successMessage: "Your course has been created successfully"
    });
    if (!error) {
      router.push(`/teacher/${data.course.id}`);
      onClose();
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await fetchApi("/api/course", {
          method: "GET",
          showSuccessToast: false,
        });
        console.log("API Response:", { data, error });
        if (!error && data.courses) {
          console.log("Courses data:", data.courses);
          setCourses(data.courses);
        } else {
          console.log("Error or no courses:", { error, courses: data.courses });
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <> 
      <header className="border-b">
        <Container className="py-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center text-sm">
              <NotebookPen size={16} className="mr-2 text-muted-foreground" aria-hidden="true" />
              <span className="text-muted-foreground">Teacher View</span>
            </span>
          </div>
        </Container>
      </header>
      <main className="min-h-screen bg-background">
        <Container className="py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl">Courses</h1>
            <Button 
              size="lg" 
              className="hover:cursor-pointer"
              onClick={onOpen}
            >
              <Plus size={16} aria-hidden="true" />
              Create course
            </Button>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[4/3] bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-2">No courses found.</p>
              <p className="text-sm text-muted-foreground">Create your first course to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {courses.map((course) => (
                <TeacherCourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </Container>
      </main>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new course</DialogTitle>
            <DialogDescription>
              Fill in the details below to create your new course
            </DialogDescription>
          </DialogHeader>
          <CourseForm onSubmit={onSubmit} onCancel={onClose} />
        </DialogContent>
      </Dialog>
    </>
  );
}