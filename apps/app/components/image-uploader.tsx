"use client"

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { ImagePlus, Star, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import EmptyState from "@/components/empty-state";

interface ImageUploaderProps {
  onImagesChange?: (images: UploadedImage[]) => void;
  initialImages?: UploadedImage[];
  maxImages?: number;
  className?: string;
}

export interface UploadedImage {
  id: string;
  url: string;
  isCover: boolean;
  file?: File;
}

export function ImageUploader({
  onImagesChange,
  initialImages = [],
  maxImages = 5,
  className,
}: ImageUploaderProps) {
  const [images, setImages] = useState<UploadedImage[]>(initialImages);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Track if we're dragging files over the component
  const [isDragging, setIsDragging] = useState(false);

  // Helper function to update images and notify parent
  const updateImages = (newImages: UploadedImage[]) => {
    setImages(newImages);
    onImagesChange?.(newImages);
  };
  
  const handleImageUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const remainingSlots = maxImages - images.length;
    
    if (remainingSlots <= 0) {
      toast.error("Maximum images reached", {
        description: `You can only upload up to ${maxImages} images`,
      });
      return;
    }
    
    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    
    // Check if we're ignoring some files due to the limit
    if (files.length > remainingSlots) {
      toast.info("Some images weren't added", {
        description: `Only added ${remainingSlots} out of ${files.length} images due to the ${maxImages} image limit.`,
      });
    }
    
    // Process each file
    filesToProcess.forEach(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error("Invalid file type", {
          description: "Only image files are allowed"
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          const newImage: UploadedImage = {
            id: crypto.randomUUID(),
            url: event.target.result,
            isCover: images.length === 0 && initialImages.length === 0, // First image is cover by default
            file
          };
          
          updateImages([...images, newImage]);
        }
      };
      
      reader.readAsDataURL(file);
    });
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(e.target.files);
  };
  
  const handleSetCover = (id: string) => {
    const updatedImages = images.map(img => ({
      ...img,
      isCover: img.id === id
    }));
    updateImages(updatedImages);
    toast.success("Cover image updated");
  };
  
  const handleDelete = (id: string) => {
    // Check if we're deleting the cover image
    const isDeletedImageCover = images.find(img => img.id === id)?.isCover || false;
    
    // Remove the image
    const updatedImages = images.filter(img => img.id !== id);
    
    // If we deleted the cover and we have other images, set the first one as cover
    if (isDeletedImageCover && updatedImages.length > 0) {
      updatedImages[0].isCover = true;
    }
    
    updateImages(updatedImages);
    toast.success("Image removed");
  };
  
  // Handle drag events for drag & drop functionality
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    handleImageUpload(files);
  };
  
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className={cn("w-full", className)}>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {images.length === 0 ? (
          <EmptyState
            title="Upload images"
            description="Drag & drop images or click to browse"
            icon={<ImagePlus className="h-8 w-8" />}
            onClick={openFileDialog}
            className="w-full h-full"
          />
        ) : (
          <div className="mt-2">
            <ScrollArea className="w-full">
              <div className="flex gap-4">
                {images.map((image) => (
                  <div key={image.id} className="relative flex-shrink-0 w-48">
                    <AspectRatio ratio={1}>
                      <Image
                        src={image.url}
                        alt="Uploaded image"
                        fill
                        className="object-cover rounded-md"
                      />
                      
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 hover:cursor-pointer"
                          onClick={() => handleSetCover(image.id)}
                        >
                          <Star
                            className={cn(
                              "h-4 w-4",
                              image.isCover ? "fill-yellow-400 text-yellow-400" : ""
                            )}
                          />
                          <span className="sr-only">Set as cover</span>
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 hover:cursor-pointer"
                          onClick={() => handleDelete(image.id)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Delete image</span>
                        </Button>
                      </div>
                      {image.isCover && (
                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                          Cover
                        </div>
                      )}
                    </AspectRatio>
                  </div>
                ))}
                
                {images.length < maxImages && (
                  <div 
                    className="relative flex-shrink-0 w-48"
                    onClick={openFileDialog}
                  >
                    <AspectRatio ratio={1}>
                      <div className="h-full border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors">
                        <div className="flex flex-col items-center gap-1 p-4 text-center">
                          <ImagePlus className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm font-medium">Add Image</span>
                          <span className="text-xs text-muted-foreground">
                            {maxImages - images.length} image{maxImages - images.length !== 1 ? 's' : ''} remaining
                          </span>
                        </div>
                      </div>
                    </AspectRatio>
                  </div>
                )}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
        disabled={images.length >= maxImages}
      />
    </div>
  );
}

export default ImageUploader;