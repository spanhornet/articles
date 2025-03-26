"use client";

// Utilities
import { fetchApi } from "@/lib/api";

// Next.js Hooks
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

// Shadcn UI
import { Container } from "@/components/container";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Lucide Icons
import { LoaderCircle, NotebookPen } from "lucide-react";

// Drizzle ORM
import type { Course } from "@repo/database";

export default function Page() {
  const { courseId } = useParams();

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getCourse() {
      if (!courseId) return;
      setIsLoading(true);
      try {
        const { data, error } = await fetchApi<{ course: Course }>(`/api/course/${courseId}`, {
          method: "GET",
          showSuccessToast: false,
          showErrorToast: false,
        });
        if (!error) setCourse(data.course);
      } finally {
        setIsLoading(false);
      }
    }
    getCourse();
  }, [courseId]);

  if (isLoading || !course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoaderCircle className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <>
      <header className="border-b">
          <Container className="py-4">
            <div className="flex items-center justify-between ">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/teacher">
                      <span className="flex items-center">
                        <NotebookPen size={16} className="mr-2 text-muted-foreground" aria-hidden="true" />
                        <span className="text-muted-foreground">Teacher view</span>
                      </span>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{course.title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </Container>
        </header>
    </>
  );
}