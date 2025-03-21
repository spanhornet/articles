"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// Components
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Icons
import { LoaderCircle, ArrowLeftIcon } from "lucide-react";

// API
import { fetchApi } from "@/lib/api";

// Form schema
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function Page() {
  const params = useParams();
  const courseId = params.courseId as string;
  const router = useRouter();
  
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Define form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: ""
    },
  });

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      setIsFetching(true);
      try {
        const response = await fetchApi(`/api/course/${courseId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch course: ${response.statusText}`);
        }
        
        const course = await response.json();
        
        // Update form with course data
        form.reset({
          title: course.title || "",
          description: course.description || "",
        });
        
        setFetchError(null);
      } catch (error) {
        console.error("Error fetching course:", error);
        setFetchError("Failed to load course data. Please try again.");
      } finally {
        setIsFetching(false);
      }
    };

    fetchCourse();
  }, [courseId, form]);

  // Handle form submission
  const onSubmit = async (values: FormData) => {
    setIsSaving(true);
    
    try {
      const response = await fetchApi(`/api/course/${courseId}`, {
        method: "PUT",
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(`Failed to update course: ${response.statusText}`);
      }
      
      // Reset form to mark fields as no longer dirty
      form.reset(values);
    } catch (error) {
      console.error("Error updating course:", error);
      // Could show an error toast notification here
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <Container>
        <div className="md:flex md:items-center md:justify-between py-6">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold">Course editor</h2>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Button 
              type="submit" 
              form="course-form" 
              disabled={isSaving || !form.formState.isDirty}
              className="min-w-28"
            >
              {isSaving ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Saving changes
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </div>

        {isFetching ? (
          <div className="flex items-center justify-center py-12">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : fetchError ? (
          <div className="rounded-lg border border-destructive p-4 bg-destructive/10 text-destructive text-center">
            {fetchError}
          </div>
        ) : (
          <div className="border rounded-lg p-6 bg-card">
            <Form {...form}>
              <form id="course-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter course title" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        This is the public title of your course.
                      </FormDescription>
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
                          {...field} 
                          className="min-h-32"
                        />
                      </FormControl>
                      <FormDescription>
                        Provide a detailed description of what students will learn.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        )}
      </Container>
    </div>
  );
}