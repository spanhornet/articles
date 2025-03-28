"use client";

// Utilities
import { fetchApi } from "@/lib/api";

// Next.js Hooks
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

// React Hooks
import { useDialog } from "@/hooks/useDialog";

// Shadcn UI
import { Container } from "@/components/container";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// React Hook Form
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Zod
import { z } from "zod";

// Lucide Icons
import { ArrowDownToLine, LoaderCircle, NotebookPen, Plus, ChevronUp, ChevronDown } from "lucide-react";

// Drizzle ORM
import type { Course, Artwork } from "@repo/database";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Page() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasArtworkChanges, setHasArtworkChanges] = useState(false);
  const { isOpen, onOpen, onClose } = useDialog();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", description: "" },
  });

  useEffect(() => {
    let isMounted = true;

    async function getCourse() {
      if (!courseId) return;
      try {
        const { data, error } = await fetchApi<{ course: Course }>(`/api/course/${courseId}`, {
          method: "GET",
          showSuccessToast: false,
          showErrorToast: false,
        });
        if (!error && isMounted) {
          setCourse(data.course);
          form.reset({ title: data.course.title, description: data.course.description || "" });
        }
      } catch (error) {
        console.error('Failed to fetch course:', error);
      }
    }

    async function getArtworks() {
      if (!courseId) return;
      try {
        const { data, error } = await fetchApi<{ artworks: Artwork[] }>(`/api/artwork/course/${courseId}`, {
          method: "GET",
          showSuccessToast: false,
          showErrorToast: false,
        });
        if (!error && isMounted) {
          setArtworks(data.artworks || []);
        }
      } catch (error) {
        console.error('Failed to fetch artworks:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    setIsLoading(true);
    Promise.all([getCourse(), getArtworks()]);

    return () => {
      isMounted = false;
    };
  }, [courseId, form]);

  const handleSave = async (values: FormValues) => {
    if (!courseId) return;
    setIsSaving(true);
    try {
      // Save course changes
      const { data: courseData, error: courseError } = await fetchApi<{ course: Course }>(`/api/course/${courseId}`, {
        method: "PUT",
        body: JSON.stringify(values),
      });

      if (courseError) {
        return;
      }

      // Save artwork changes
      if (hasArtworkChanges) {
        // Handle updated artworks
        for (const artwork of artworks) {
          const { error: updateError } = await fetchApi(`/api/artwork/${artwork.id}`, {
            method: "PUT",
            body: JSON.stringify({
              title: artwork.title,
              description: artwork.description,
              author: artwork.author,
              order: artwork.order,
            }),
          });
          if (updateError) {
            return;
          }
        }
      }

      setCourse(courseData.course);
      form.reset({ title: courseData.course.title, description: courseData.course.description || "" });
      setHasArtworkChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddArtwork = async () => {
    if (!courseId) return;
    
    try {
      const newOrder = artworks.length;
      console.log('Creating new artwork with order:', newOrder);
      
      const { data, error } = await fetchApi<{ artwork: Artwork }>('/api/artwork', {
        method: "POST",
        body: JSON.stringify({
          title: "New Artwork",
          description: "Add a description for this artwork",
          courseId,
          author: "Unknown Artist",
          coverImage: "",
          extraImages: [],
          periodTags: [],
          typeTags: [],
          link: "",
          order: newOrder,
        }),
      });

      if (error) {
        console.error('Error creating artwork:', error);
        return;
      }

      console.log('Created artwork:', data.artwork);
      setArtworks([...artworks, data.artwork]);
      setHasArtworkChanges(true);
    } catch (error) {
      console.error('Failed to create artwork:', error);
    }
  };

  const handleArtworkChange = (artworkId: string, field: 'title' | 'description' | 'author' | 'order', value: string | number) => {
    const updatedArtworks = artworks.map((a) =>
      a.id === artworkId ? { ...a, [field]: value } : a
    );
    setArtworks(updatedArtworks);
    setHasArtworkChanges(true);
  };

  const handleMoveArtwork = (artworkId: string, direction: 'up' | 'down') => {
    const currentIndex = artworks.findIndex(a => a.id === artworkId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Check if the move is valid
    if (newIndex < 0 || newIndex >= artworks.length) return;

    // Create a new array with the reordered artworks
    const updatedArtworks = [...artworks];
    const [movedArtwork] = updatedArtworks.splice(currentIndex, 1);
    updatedArtworks.splice(newIndex, 0, movedArtwork);

    // Update the order property for all artworks
    const reorderedArtworks = updatedArtworks.map((artwork, index) => ({
      ...artwork,
      order: index
    }));

    setArtworks(reorderedArtworks);
    setHasArtworkChanges(true);
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
                      <span className="text-muted-foreground">Teacher View</span>
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
            <h1 className="text-2xl font-bold">Course editor</h1>
            <Button 
              size="lg" 
              className="hover:cursor-pointer"
              onClick={form.handleSubmit(handleSave)}
              disabled={isSaving || (!form.formState.isDirty && !hasArtworkChanges)}
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
          <div className="grid gap-y-6">
            <Card className="mb-6">
              <CardHeader>
                <div>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription className="mt-2">Edit basic information for this course</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form className="space-y-6">
                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course title</FormLabel>
                        <FormControl><Input placeholder="Enter course title" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course description</FormLabel>
                        <FormControl><Textarea placeholder="Enter course description" className="min-h-[200px]" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </form>
                </Form>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Artworks</CardTitle>
                  <CardDescription className="mt-2">Add and edit artworks for your course</CardDescription>
                </div>
                <Button 
                  size="lg" 
                  variant="default"
                  className="hover:cursor-pointer"
                  onClick={handleAddArtwork}
                >  
                  <Plus size={16} aria-hidden="true" />
                  Add artwork 
                </Button>
              </CardHeader>
              <CardContent>
                {artworks.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No artworks added yet. Click the button above to add one.</p>
                ) : (
                  <div className="space-y-4">
                    {artworks.map((artwork) => (
                      <div key={artwork.id} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{artwork.order + 1}</span>
                            <span className="font-medium">{artwork.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 hover:cursor-pointer"
                              onClick={() => handleMoveArtwork(artwork.id, 'up')}
                              disabled={artwork.order === 0}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 hover:cursor-pointer"
                              onClick={() => handleMoveArtwork(artwork.id, 'down')}
                              disabled={artwork.order === artworks.length - 1}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor={`title-${artwork.id}`} className="text-sm font-medium">
                            Title
                          </label>
                          <Input
                            id={`title-${artwork.id}`}
                            value={artwork.title}
                            onChange={(e) => {
                              handleArtworkChange(artwork.id, 'title', e.target.value);
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor={`author-${artwork.id}`} className="text-sm font-medium">
                            Author
                          </label>
                          <Input
                            id={`author-${artwork.id}`}
                            value={artwork.author}
                            onChange={(e) => {
                              handleArtworkChange(artwork.id, 'author', e.target.value);
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor={`description-${artwork.id}`} className="text-sm font-medium">
                            Description
                          </label>
                          <Textarea
                            id={`description-${artwork.id}`}
                            value={artwork.description}
                            onChange={(e) => {
                              handleArtworkChange(artwork.id, 'description', e.target.value);
                            }}
                            className="min-h-[100px]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </Container>
      </main>
    </>
  );
}
