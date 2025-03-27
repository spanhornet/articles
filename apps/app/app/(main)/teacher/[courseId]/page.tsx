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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// React Hook Form
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Zod
import { z } from "zod";

// Lucide Icons
import { ArrowDownToLine, LoaderCircle, NotebookPen, PencilRuler } from "lucide-react";

// Drizzle ORM
import type { Course } from "@repo/database";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Page() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

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
        if (!error) {
          setCourse(data.course);
          form.reset({
            title: data.course.title,
            description: data.course.description || "",
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
    getCourse();
  }, [courseId, form]);

  const handleSave = async (values: FormValues) => {
    if (!courseId) return;
    setIsSaving(true);
    try {
      const { data, error } = await fetchApi<{ course: Course }>(`/api/course/${courseId}`, {
        method: "PUT",
        body: JSON.stringify(values),
      });
      if (!error) {
        setCourse(data.course);
        form.reset({
          title: data.course.title,
          description: data.course.description || "",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

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
          <div className="flex items-center justify-between">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/teacher">
                    <span className="flex items-center">
                      <NotebookPen size={16} className="text-muted-foreground mr-2" aria-hidden="true" />
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
      <main>
        <Container className="py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold flex items-center">
              Course editor
            </h1>
            <div className="flex items-center">
              <Button 
                size="sm" 
                className="hover:cursor-pointer"
                onClick={form.handleSubmit(handleSave)}
                disabled={isSaving || !form.formState.isDirty}
              >
                {isSaving ? (
                  <>
                    <LoaderCircle className="animate-spin h-4 w-4" />
                    Saving changes
                  </>
                ) : (
                  <>
                    <ArrowDownToLine size={16} aria-hidden="true" />
                    Save changes
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Edit basic information that students will see when browsing courses.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Form {...form}>
                  <form className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter course title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter course description" 
                              className="min-h-[200px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </Container>
      </main>
    </>
  );
}