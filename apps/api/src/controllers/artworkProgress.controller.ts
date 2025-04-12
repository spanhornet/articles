import { Request, Response } from 'express';
import { db, schema } from '@repo/database';
import { eq, and, count } from 'drizzle-orm';
import { auth } from "../auth";
import { fromNodeHeaders } from "better-auth/node";
import { APIError } from "better-auth/api";

export const markArtworkAsCompleted = async (req: Request, res: Response) => {
  try {
    const { artworkId } = req.params;

    // Validate input
    if (!artworkId) {
      return res.status(400).json({
        title: "Invalid Input",
        message: "Artwork ID is required",
        details: { missingFields: ["artworkId"] }
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
        message: "You must be logged in to update your progress",
        details: { reason: "no_session" }
      });
    }

    // Find the artwork progress entry
    const [artworkProgress] = await db.select()
      .from(schema.artworkProgress)
      .where(and(
        eq(schema.artworkProgress.artworkId, artworkId),
        eq(schema.artworkProgress.userId, session.user.id)
      ))
      .limit(1);

    if (!artworkProgress) {
      return res.status(404).json({
        title: "Not Found",
        message: "Artwork progress not found or you're not enrolled in this course",
        details: { artworkId }
      });
    }

    // Already completed, just return success
    if (artworkProgress.isCompleted) {
      return res.status(200).json({
        title: "Already Completed",
        message: "You have already completed this artwork",
        artworkProgress
      });
    }

    // Update artwork progress to completed
    const now = new Date();
    const [updatedProgress] = await db.update(schema.artworkProgress)
      .set({
        isCompleted: true,
        completedAt: now,
        updatedAt: now
      })
      .where(eq(schema.artworkProgress.id, artworkProgress.id))
      .returning();

    // Get the enrollment to update overall progress
    const [enrollment] = await db.select()
      .from(schema.enrollments)
      .where(eq(schema.enrollments.id, artworkProgress.enrollmentId))
      .limit(1);

    if (enrollment) {
      // Get total artworks in the course and completed artworks
      const totalArtworks = await db.select({ count: count() })
        .from(schema.artworks)
        .where(eq(schema.artworks.courseId, enrollment.courseId));

      const completedArtworks = await db.select({ count: count() })
        .from(schema.artworkProgress)
        .where(and(
          eq(schema.artworkProgress.enrollmentId, enrollment.id),
          eq(schema.artworkProgress.isCompleted, true)
        ));

      const totalCount = totalArtworks[0]?.count || 0;
      const completedCount = completedArtworks[0]?.count || 0;
      
      // Calculate progress percentage
      const progressPercentage = totalCount > 0 
        ? Math.round((completedCount / totalCount) * 100) 
        : 0;

      // Update enrollment progress
      const updateData: {
        progress: number;
        updatedAt: Date;
        completedAt?: Date;
      } = {
        progress: progressPercentage,
        updatedAt: now
      };

      // If 100% complete, mark the enrollment as completed
      if (progressPercentage === 100) {
        updateData.completedAt = now;
      }

      await db.update(schema.enrollments)
        .set(updateData)
        .where(eq(schema.enrollments.id, enrollment.id));
    }

    return res.status(200).json({
      title: "Progress Updated",
      message: "Your progress has been updated successfully",
      artworkProgress: updatedProgress
    });

  } catch (error: any) {
    console.error("Update artwork progress error:", error);
    
    // Handle specific errors from Better-Auth
    if (error instanceof APIError) {
      return res.status(error.statusCode).json({
        title: "Authentication Error",
        message: error.message || "Failed to update progress",
        details: { errorCode: error.statusCode, errorType: error.status }
      });
    }

    // Generic error handler
    return res.status(500).json({
      title: "Server Error",
      message: "An error occurred while updating your progress",
      details: process.env.ENVIRONMENT === "DEVELOPMENT" ? { error: error.message } : undefined
    });
  }
};

export const getArtworkProgress = async (req: Request, res: Response) => {
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
        message: "You must be logged in to view your progress",
        details: { reason: "no_session" }
      });
    }

    // Find the enrollment
    const [enrollment] = await db.select()
      .from(schema.enrollments)
      .where(and(
        eq(schema.enrollments.courseId, courseId),
        eq(schema.enrollments.userId, session.user.id)
      ))
      .limit(1);

    if (!enrollment) {
      return res.status(404).json({
        title: "Not Enrolled",
        message: "You are not enrolled in this course",
        details: { courseId }
      });
    }

    // Get all artworks for the course
    const artworks = await db.select()
      .from(schema.artworks)
      .where(eq(schema.artworks.courseId, courseId))
      .orderBy(schema.artworks.order);

    // Get progress for each artwork
    const artworkProgress = await db.select()
      .from(schema.artworkProgress)
      .where(eq(schema.artworkProgress.enrollmentId, enrollment.id));

    // Map progress to artworks
    const artworksWithProgress = artworks.map(artwork => {
      const progress = artworkProgress.find(p => p.artworkId === artwork.id);
      return {
        ...artwork,
        progress: progress ? {
          isCompleted: progress.isCompleted,
          completedAt: progress.completedAt,
          viewedAt: progress.viewedAt
        } : {
          isCompleted: false,
          completedAt: null,
          viewedAt: null
        }
      };
    });

    return res.status(200).json({
      title: "Progress Retrieved",
      message: "Your course progress has been retrieved successfully",
      enrollment,
      artworks: artworksWithProgress
    });

  } catch (error: any) {
    console.error("Get artwork progress error:", error);
    
    // Generic error handler
    return res.status(500).json({
      title: "Server Error",
      message: "An error occurred while retrieving your progress",
      details: process.env.ENVIRONMENT === "DEVELOPMENT" ? { error: error.message } : undefined
    });
  }
}; 