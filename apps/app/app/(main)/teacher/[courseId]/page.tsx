"use client";

// Utilities
import { fetchApi } from "@/lib/api";

// Helper functions
const truncateText = (text: string, limit: number) => {
  return text.length > limit ? `${text.substring(0, limit)}...` : text;
};

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
import { ArrowDownToLine, LoaderCircle, NotebookPen, Plus, ChevronUp, ChevronDown, Palette, Trash2, Notebook } from "lucide-react";

// Drizzle ORM
import type { Course, Artwork } from "@repo/database";

import EmptyState from "@/components/empty-state";
import ImageUploader from "@/app/(main)/teacher/[courseId]/ImageUploader";

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
  const [artworkToDelete, setArtworkToDelete] = useState<string | null>(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", description: "" },
  });

  const hasUnsavedChanges = form.formState.isDirty || hasArtworkChanges;

  const handleNavigation = (path: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(path);
      setShowUnsavedDialog(true);
    } else {
      window.location.href = path;
    }
  };

  const handleSaveAndNavigate = async () => {
    if (!pendingNavigation) return;
    
    await handleSave(form.getValues());
    window.location.href = pendingNavigation;
  };

  const handleDiscardAndNavigate = () => {
    if (!pendingNavigation) return;
    window.location.href = pendingNavigation;
  };

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
              coverImage: artwork.coverImage,
              extraImages: artwork.extraImages,
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

      
      const { data, error } = await fetchApi<{ artwork: Artwork }>('/api/artwork', {
        method: "POST",
        body: JSON.stringify({
          title: "New Artwork",
          description: "Add a description for this artwork",
          courseId,
          author: "Unknown Artist",
          coverImage: null,
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

      // Batch the state updates together
      setArtworks(prevArtworks => [...prevArtworks, data.artwork]);
      setHasArtworkChanges(true);
    } catch (error) {
      console.error('Failed to create artwork:', error);
    }
  };

  const handleArtworkChange = (artworkId: string, field: 'title' | 'description' | 'author' | 'order' | 'coverImage' | 'extraImages', value: string | number | string[]) => {
    setArtworks(prevArtworks => {
      const updatedArtworks = prevArtworks.map((a) =>
        a.id === artworkId ? { ...a, [field]: value } : a
      );
      setHasArtworkChanges(true);
      return updatedArtworks;
    });
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

  const handleDeleteArtwork = async (artworkId: string) => {
    try {
      const { error } = await fetchApi(`/api/artwork/${artworkId}`, {
        method: "DELETE",
      });

      if (error) {
        console.error('Error deleting artwork:', error);
        return;
      }

      setArtworks(prevArtworks => prevArtworks.filter(a => a.id !== artworkId));
      setHasArtworkChanges(true);
      onClose();
    } catch (error) {
      console.error('Failed to delete artwork:', error);
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
                  <BreadcrumbLink onClick={() => handleNavigation('/')} className="cursor-pointer">
                    <span className="flex items-center">
                      <Notebook size={16} className="text-muted-foreground mr-2" aria-hidden="true" />
                      <span className="text-muted-foreground">Student View</span>
                    </span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={() => handleNavigation('/teacher')} className="cursor-pointer">
                    <span className="flex items-center">
                      <NotebookPen size={16} className="text-muted-foreground mr-2" aria-hidden="true" />
                      <span className="text-muted-foreground">Teacher View</span>
                    </span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{truncateText(course.title, 15)}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </Container>
      </header>
      <main>
        <Container className="py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl">Course Editor</h1>
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
            <Card className="">
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
                  <CardDescription className="mt-2">Create and edit artworks for your course</CardDescription>
                </div>
                <Button 
                  size="lg" 
                  variant="default"
                  className="hover:cursor-pointer"
                  onClick={handleAddArtwork}
                >  
                  <Plus size={16} aria-hidden="true" />
                  Create artwork 
                </Button>
              </CardHeader>
              <CardContent>
                {artworks.length === 0 ? (
                  <EmptyState
                    title="No artworks yet"
                    description="Start building your course by creating an artwork."
                    className="w-full"
                    icon={<Palette className="h-8 w-8" />}
                    onClick={handleAddArtwork}
                  />
                ) : (
                  <div className="space-y-4">
                    {artworks.map((artwork) => (
                      <div key={artwork.id} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{artwork.title || "Untitled Artwork"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 hover:cursor-pointer text-destructive hover:text-destructive"
                              onClick={() => {
                                setArtworkToDelete(artwork.id);
                                onOpen();
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <label htmlFor={`title-${artwork.id}`} className="text-sm font-medium block">
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
                            <label htmlFor={`author-${artwork.id}`} className="text-sm font-medium block">
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
                            <label htmlFor={`description-${artwork.id}`} className="text-sm font-medium block">
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
                          <div className="space-y-2">
                            <label htmlFor={`images-${artwork.id}`} className="text-sm font-medium block">
                              Images
                            </label>
                            <ImageUploader
                              onImagesChange={(images) => {
                                const coverImage = images.find(img => img.isCover)?.url || '';
                                const extraImages = images.filter(img => !img.isCover).map(img => img.url);
                                handleArtworkChange(artwork.id, 'coverImage', coverImage);
                                handleArtworkChange(artwork.id, 'extraImages', extraImages);
                              }}
                              initialImages={[
                                ...(artwork.coverImage ? [{ id: 'cover', url: artwork.coverImage, isCover: true }] : []),
                                ...(artwork.extraImages || []).map((url, index) => ({ 
                                  id: `extra-${index}`, 
                                  url, 
                                  isCover: false 
                                }))
                              ]}
                            />
                          </div>
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
      <Dialog open={isOpen && artworkToDelete !== null} onOpenChange={() => {
        onClose();
        setArtworkToDelete(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Artwork</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this artwork? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" className="hover:cursor-pointer" onClick={() => {
              onClose();
              setArtworkToDelete(null);
            }}>
              Cancel
            </Button>
            <Button variant="destructive" className="hover:cursor-pointer" onClick={() => artworkToDelete && handleDeleteArtwork(artworkToDelete)}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Would you like to save them before leaving?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" className="hover:cursor-pointer" onClick={() => {
              setShowUnsavedDialog(false);
              setPendingNavigation(null);
            }}>
              Cancel
            </Button>
            <Button variant="secondary" className="hover:cursor-pointer" onClick={handleDiscardAndNavigate}>
              Discard changes
            </Button>
            <Button className="hover:cursor-pointer" onClick={handleSaveAndNavigate} disabled={isSaving}>
              {isSaving ? (
                <>
                  <LoaderCircle className="animate-spin h-4 w-4 mr-2" />
                  Saving...
                </>
              ) : (
                'Save and leave'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
