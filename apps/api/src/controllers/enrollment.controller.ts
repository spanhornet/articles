import { Request, Response } from 'express';
import { db, schema } from '@repo/database';
import { eq, and } from 'drizzle-orm';
import { auth } from "../auth";
import { fromNodeHeaders } from "better-auth/node";
import { APIError } from "better-auth/api";

export const enrollInCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.body;

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
        message: "You must be logged in to enroll in a course",
        details: { reason: "no_session" }
      });
    }

    // Check if the course exists and is published
    const [course] = await db.select()
      .from(schema.courses)
      .where(and(
        eq(schema.courses.id, courseId),
        eq(schema.courses.isPublished, true)
      ))
      .limit(1);

    if (!course) {
      return res.status(404).json({
        title: "Course Not Available",
        message: "This course doesn't exist or is not published yet",
        details: { courseId }
      });
    }

    // Check if user is already enrolled in this course
    const [existingEnrollment] = await db.select()
      .from(schema.enrollments)
      .where(and(
        eq(schema.enrollments.userId, session.user.id),
        eq(schema.enrollments.courseId, courseId)
      ))
      .limit(1);

    if (existingEnrollment) {
      return res.status(409).json({
        title: "Already Enrolled",
        message: "You are already enrolled in this course",
        details: { enrollmentId: existingEnrollment.id }
      });
    }

    // Create new enrollment
    const enrollmentId = crypto.randomUUID();
    const [enrollment] = await db.insert(schema.enrollments).values({
      id: enrollmentId,
      userId: session.user.id,
      courseId: courseId,
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    // Get all artworks for this course to create progress entries
    const artworks = await db.select()
      .from(schema.artworks)
      .where(eq(schema.artworks.courseId, courseId));

    // Create artwork progress entries for each artwork
    if (artworks.length > 0) {
      const artworkProgressValues = artworks.map(artwork => ({
        id: crypto.randomUUID(),
        userId: session.user.id,
        artworkId: artwork.id,
        enrollmentId: enrollmentId,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      await db.insert(schema.artworkProgress).values(artworkProgressValues);
    }

    return res.status(201).json({
      title: "Enrollment Successful",
      message: "You have successfully enrolled in this course",
      enrollment
    });

  } catch (error: any) {
    console.error("Enrollment error:", error);
    
    // Handle specific errors from Better-Auth
    if (error instanceof APIError) {
      return res.status(error.statusCode).json({
        title: "Authentication Error",
        message: error.message || "Failed to enroll in course",
        details: { errorCode: error.statusCode, errorType: error.status }
      });
    }

    // Generic error handler
    return res.status(500).json({
      title: "Server Error",
      message: "An error occurred while enrolling in the course",
      details: process.env.ENVIRONMENT === "DEVELOPMENT" ? { error: error.message } : undefined
    });
  }
};

export const getStudentEnrollments = async (req: Request, res: Response) => {
  try {
    // Get the authenticated user session
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    // If no session, return unauthorized
    if (!session || !session.user) {
      return res.status(401).json({
        title: "Authentication Required",
        message: "You must be logged in to view your enrollments",
        details: { reason: "no_session" }
      });
    }

    // Get all user enrollments
    const enrollments = await db.select({
      id: schema.enrollments.id,
      courseId: schema.enrollments.courseId,
      progress: schema.enrollments.progress,
      completedAt: schema.enrollments.completedAt,
      createdAt: schema.enrollments.createdAt
    })
    .from(schema.enrollments)
    .where(eq(schema.enrollments.userId, session.user.id))
    .orderBy(schema.enrollments.createdAt);

    // Get course details for each enrollment
    const enrollmentsWithDetails = await Promise.all(
      enrollments.map(async (enrollment) => {
        // Get course info
        const [course] = await db.select({
          id: schema.courses.id,
          title: schema.courses.title,
          description: schema.courses.description,
          publishedAt: schema.courses.publishedAt,
          userId: schema.courses.userId
        })
        .from(schema.courses)
        .where(eq(schema.courses.id, enrollment.courseId))
        .limit(1);

        // Get teacher info
        const [teacher] = course ? await db.select({
          id: schema.users.id,
          name: schema.users.name
        })
        .from(schema.users)
        .where(eq(schema.users.id, course.userId))
        .limit(1) : [null];

        // Get artworks for course (first one for thumbnail)
        const artworks = course ? await db.select({
          id: schema.artworks.id,
          title: schema.artworks.title,
          description: schema.artworks.description,
          coverImage: schema.artworks.coverImage,
          createdAt: schema.artworks.createdAt
        })
        .from(schema.artworks)
        .where(eq(schema.artworks.courseId, course.id))
        .orderBy(schema.artworks.order)
        .limit(1) : [];

        return {
          ...enrollment,
          course: course || { title: "Unknown Course" },
          teacher: teacher || { name: "Unknown Teacher" },
          artwork: artworks.length > 0 ? artworks[0] : null
        };
      })
    );

    return res.status(200).json({
      title: "Enrollments Retrieved",
      message: "Your enrollments have been retrieved successfully",
      enrollments: enrollmentsWithDetails
    });

  } catch (error: any) {
    console.error("Get enrollments error:", error);
    
    // Generic error handler
    return res.status(500).json({
      title: "Server Error",
      message: "An error occurred while retrieving your enrollments",
      details: process.env.ENVIRONMENT === "DEVELOPMENT" ? { error: error.message } : undefined
    });
  }
}; 