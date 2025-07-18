// Zod
import { z } from "zod";

// Artwork Form Schema

export const artworkFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  author: z.string().min(1, { message: "Author is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  content: z.string().min(1, { message: "Content is required" }),
  images: z.array(z.any()).optional(),
  collocation: z.string().optional(),
  link: z.string().refine((val) => val === '' || /^https?:\/\/.*/.test(val), {
    message: "Link is an invalid URL"
  }).optional(),
});

export type ArtworkFormValues = z.infer<typeof artworkFormSchema>;

// Course Form Schema

export const courseFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  artworkIds: z.array(z.string()).default([]),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;