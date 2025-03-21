"use client";

import { fetchApi } from "@/lib/api";

// React Hooks
import { useState } from "react";

// Next.js
import { useRouter } from "next/navigation";

// Authorization
import { useAuthContext } from "@/app/(auth)/AuthProvider";

// Shadcn/ui Components
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Container } from "@/components/container";

// Lucide Icons
import { LoaderCircle, NotebookIcon, NotebookPenIcon, NotebookTextIcon, PlusIcon } from "lucide-react";

export default function Page() {
  const { user } = useAuthContext();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const router = useRouter();

  const handleCreateCourse = async () => {
    try {
      setIsCreating(true);
      
      // Call the API to create a new course
      const response = await fetchApi("/api/course/", {
        method: "POST",
        body: JSON.stringify({
          teacherId: user?.id,
          teacherName: user?.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create course");
      }

      // Get the new course data
      const course = await response.json();
      
      // Close the dialog
      setIsDialogOpen(false);
      
      // Redirect to the course page
      router.push(`/teacher/${course.id}`);
    } catch (error) {
      console.error("Error creating course:", error);
      // You could add a toast notification here for error feedback
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <header className="border-b py-4">
        <Container className="flex items-center justify-between">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/student" className="inline-flex items-center gap-1.5">
                  <NotebookIcon size={16} aria-hidden="true" />
                  Student view
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="inline-flex items-center gap-1.5">
                  <NotebookPenIcon size={16} aria-hidden="true" />
                  Teacher view
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Container>
      </header>
      <main className="py-6">
        <Container>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Teacher view</h1>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusIcon className="h-4 w-4" /> New course
            </Button>
          </div>
        </Container>
      </main>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-sm w-sm">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              Are you sure you want to create a new course? This will create a blank course that you can edit.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleCreateCourse} disabled={isCreating}>
              {isCreating ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Creating course
                </>
              ) : (
                "Create course"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}