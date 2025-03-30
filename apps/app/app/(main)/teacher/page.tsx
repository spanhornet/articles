"use client"

// React Hooks
import { useDialog } from "@/hooks/useDialog";
import { useRouter } from "next/navigation";

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

export default function Page() {
  const router = useRouter();

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
      <main>
        <Container className="py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl">Your courses</h1>
            <div className="flex items-center">
              <Button 
                size="lg" 
                className="hover:cursor-pointer"
                onClick={onOpen}
              >
                <Plus size={16} aria-hidden="true" />
                Create course
              </Button>
            </div>
          </div>
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