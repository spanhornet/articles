import { Request, Response } from 'express';
import { db, schema } from '@repo/database';
import { eq, and } from 'drizzle-orm';
import { auth } from "../auth";
import { fromNodeHeaders } from "better-auth/node";
import { APIError } from "better-auth/api";

export const createArtwork = async (req: Request, res: Response) => {
  try {
    const { title, description, courseId } = req.body;

    // Validate input
    if (!title || !description || !courseId) {
      return res.status(400).json({
        title: "Invalid Input",
        message: "Title, description, and courseId are required",
        details: {
          missingFields: [
            !title && "title",
            !description && "description",
            !courseId && "courseId"
          ].filter(Boolean)
        }
      });
    }

    // Get the authenticated user session
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    // If no session, return unauthorized
    if (!session || !session.user) {
      return res.status(401).json({
        title: "Authentication Required",
        message: "You must be logged in to create an artwork",
        details: { reason: "no_session" }
      });
    }

    // Verify that the course belongs to the user
    const [course] = await db.select().from(schema.courses)
      .where(and(
        eq(schema.courses.id, courseId),
        eq(schema.courses.userId, session.user.id)
      ))
      .limit(1);

    if (!course) {
      return res.status(404).json({
        title: "Not Found",
        message: "Course not found or you don't have permission to add artwork to it",
        details: { courseId }
      });
    }

    // Create the artwork with all required fields
    const [newArtwork] = await db.insert(schema.artworks).values({
      id: crypto.randomUUID(),
      title: title || "New Artwork",
      description: description || "",
      author: req.body.author || "Unknown Artist",
      coverImage: null,
      extraImages: [], // Empty array as default
      periodTags: [], // Empty array as default
      typeTags: [], // Empty array as default
      link: req.body.link || "", // Use link from request body or default to empty string
      order: req.body.order || 0, // Use order from request body or default to 0
      collocation: req.body.collocation || "", // Add collocation field with empty string default
      courseId,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    return res.status(201).json({
      title: "Artwork Created",
      message: "Artwork has been created successfully",
      artwork: newArtwork
    });

  } catch (error: any) {
    console.error("Create artwork error:", error);
    
    // Handle specific errors from Better-Auth
    if (error instanceof APIError) {
      return res.status(error.statusCode).json({
        title: "Authentication Error",
        message: error.message || "Failed to create artwork",
        details: { errorCode: error.statusCode, errorType: error.status }
      });
    }

    // Handle database errors
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({
        title: "Database Error",
        message: "An artwork with this title already exists in this course",
        details: { errorCode: error.code }
      });
    }

    // Generic error handler
    return res.status(500).json({
      title: "Server Error",
      message: "An error occurred while creating the artwork",
      details: process.env.ENVIRONMENT === "DEVELOPMENT" ? { error: error.message } : undefined
    });
  }
};

export const updateArtwork = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, author, order, coverImage, extraImages, collocation } = req.body;

    // Validate input
    if (!id) {
      return res.status(400).json({
        title: "Invalid Input",
        message: "Artwork ID is required",
        details: { missingFields: ["id"] }
      });
    }

    if (!title && !description && order === undefined) {
      return res.status(400).json({
        title: "Invalid Input",
        message: "At least one field (title, description, or order) must be provided for update",
        details: { missingFields: ["title", "description", "order"] }
      });
    }

    // Get the authenticated user session
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    // If no session, return unauthorized
    if (!session || !session.user) {
      return res.status(401).json({
        title: "Authentication Required",
        message: "You must be logged in to update an artwork",
        details: { reason: "no_session" }
      });
    }

    // First check if the artwork exists and belongs to the user's course
    const [existingArtwork] = await db.select()
      .from(schema.artworks)
      .innerJoin(schema.courses, eq(schema.artworks.courseId, schema.courses.id))
      .where(and(
        eq(schema.artworks.id, id),
        eq(schema.courses.userId, session.user.id)
      ))
      .limit(1);

    // If artwork not found or doesn't belong to user's course
    if (!existingArtwork) {
      return res.status(404).json({
        title: "Not Found",
        message: "Artwork not found or you don't have permission to update it",
        details: { artworkId: id }
      });
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    // Only include fields that are provided in the request
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (author) updateData.author = author;
    if (order !== undefined) updateData.order = order;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (extraImages !== undefined) updateData.extraImages = extraImages;
    if (collocation !== undefined) updateData.collocation = collocation;
    if (req.body.link !== undefined) updateData.link = req.body.link;

    // Update the artwork in the database
    const [updatedArtwork] = await db.update(schema.artworks)
      .set(updateData)
      .where(eq(schema.artworks.id, id))
      .returning();

    return res.status(200).json({
      title: "Artwork Updated",
      message: "Artwork has been updated successfully",
      artwork: updatedArtwork
    });

  } catch (error: any) {
    console.error("Update artwork error:", error);
    
    // Handle specific errors from Better-Auth
    if (error instanceof APIError) {
      return res.status(error.statusCode).json({
        title: "Authentication Error",
        message: error.message || "Failed to update artwork",
        details: { errorCode: error.statusCode, errorType: error.status }
      });
    }

    // Handle database errors
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({
        title: "Database Error",
        message: "An artwork with this title already exists in this course",
        details: { errorCode: error.code }
      });
    }

    // Generic error handler
    return res.status(500).json({
      title: "Server Error",
      message: "An error occurred while updating the artwork",
      details: process.env.ENVIRONMENT === "DEVELOPMENT" ? { error: error.message } : undefined
    });
  }
};

export const getArtworksByCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    // Validate input
    if (!courseId) {
      return res.status(400).json({
        title: "Invalid Input",
        message: "Course ID is required",
        details: { missingFields: ["courseId"] }
      });
    }

    // Get the authenticated user session
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    // If no session, return unauthorized
    if (!session || !session.user) {
      return res.status(401).json({
        title: "Authentication Required",
        message: "You must be logged in to view artworks",
        details: { reason: "no_session" }
      });
    }

    // Verify that the course belongs to the user
    const [course] = await db.select().from(schema.courses)
      .where(and(
        eq(schema.courses.id, courseId),
        eq(schema.courses.userId, session.user.id)
      ))
      .limit(1);

    if (!course) {
      return res.status(404).json({
        title: "Not Found",
        message: "Course not found or you don't have permission to view its artworks",
        details: { courseId }
      });
    }

    // Get all artworks for the course
    const artworks = await db.select()
      .from(schema.artworks)
      .where(eq(schema.artworks.courseId, courseId))
      .orderBy(schema.artworks.order);

    return res.status(200).json({
      title: "Artworks Retrieved",
      message: "Artworks have been retrieved successfully",
      artworks
    });

  } catch (error: any) {
    console.error("Get artworks error:", error);
    
    // Handle specific errors from Better-Auth
    if (error instanceof APIError) {
      return res.status(error.statusCode).json({
        title: "Authentication Error",
        message: error.message || "Failed to retrieve artworks",
        details: { errorCode: error.statusCode, errorType: error.status }
      });
    }

    // Generic error handler
    return res.status(500).json({
      title: "Server Error",
      message: "An error occurred while retrieving the artworks",
      details: process.env.ENVIRONMENT === "DEVELOPMENT" ? { error: error.message } : undefined
    });
  }
};

export const deleteArtwork = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate input
    if (!id) {
      return res.status(400).json({
        title: "Invalid Input",
        message: "Artwork ID is required",
        details: { missingFields: ["id"] }
      });
    }

    // Get the authenticated user session
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    // If no session, return unauthorized
    if (!session || !session.user) {
      return res.status(401).json({
        title: "Authentication Required",
        message: "You must be logged in to delete an artwork",
        details: { reason: "no_session" }
      });
    }

    // First check if the artwork exists and belongs to the user's course
    const [existingArtwork] = await db.select()
      .from(schema.artworks)
      .innerJoin(schema.courses, eq(schema.artworks.courseId, schema.courses.id))
      .where(and(
        eq(schema.artworks.id, id),
        eq(schema.courses.userId, session.user.id)
      ))
      .limit(1);

    // If artwork not found or doesn't belong to user's course
    if (!existingArtwork) {
      return res.status(404).json({
        title: "Not Found",
        message: "Artwork not found or you don't have permission to delete it",
        details: { artworkId: id }
      });
    }

    // Delete the artwork
    await db.delete(schema.artworks)
      .where(eq(schema.artworks.id, id));

    return res.status(200).json({
      title: "Artwork Deleted",
      message: "Artwork has been deleted successfully",
      artworkId: id
    });

  } catch (error: any) {
    console.error("Delete artwork error:", error);
    
    // Handle specific errors from Better-Auth
    if (error instanceof APIError) {
      return res.status(error.statusCode).json({
        title: "Authentication Error",
        message: error.message || "Failed to delete artwork",
        details: { errorCode: error.statusCode, errorType: error.status }
      });
    }

    // Generic error handler
    return res.status(500).json({
      title: "Server Error",
      message: "An error occurred while deleting the artwork",
      details: process.env.ENVIRONMENT === "DEVELOPMENT" ? { error: error.message } : undefined
    });
  }
};
