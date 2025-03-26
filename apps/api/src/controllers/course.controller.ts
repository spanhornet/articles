// Express
import { Request, Response } from "express";

// Drizzle ORM
import { db, schema } from "@repo/database";
import { eq, and } from "drizzle-orm";

// Better-Auth
import { auth } from "../auth";
import { fromNodeHeaders } from "better-auth/node";
import { APIError } from "better-auth/api";

export const createCourse = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;

    // Validate input
    if (!title || !description) {
      return res.status(400).json({
        title: "Invalid Input",
        message: "Title and description are required",
        details: {
          missingFields: [
            !title && "title",
            !description && "description"
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
        message: "You must be logged in to create a course",
        details: { reason: "no_session" }
      });
    }

    // Create the course in the database
    const [ course ] = await db.insert(schema.courses).values({
      id: crypto.randomUUID(), // Generate a unique ID for the course
      title,
      description,
      userId: session.user.id
    }).returning();

    return res.status(201).json({
      title: "Course Created",
      message: "Course has been created successfully",
      course
    });

  } catch (error: any) {
    console.error("Create course error:", error);
    
    // Handle specific errors from Better-Auth
    if (error instanceof APIError) {
      return res.status(error.statusCode).json({
        title: "Authentication Error",
        message: error.message || "Failed to create course",
        details: { errorCode: error.statusCode, errorType: error.status }
      });
    }

    // Handle database errors
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({
        title: "Database Error",
        message: "A course with this title already exists",
        details: { errorCode: error.code }
      });
    }

    // Generic error handler
    return res.status(500).json({
      title: "Server Error",
      message: "An error occurred while creating the course",
      details: process.env.ENVIRONMENT === "DEVELOPMENT" ? { error: error.message } : undefined
    });
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    // Validate input
    if (!courseId) {
      return res.status(400).json({
        title: "Invalid Input",
        message: "Course ID is required",
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
        message: "You must be logged in to view a course",
        details: { reason: "no_session" }
      });
    }

    // Get the course from the database
    const [ course ] = await db.select().from(schema.courses)
      .where(and(
        eq(schema.courses.id, courseId),
        eq(schema.courses.userId, session.user.id)
      ))
      .limit(1);

    // If course not found or doesn't belong to user
    if (!course) {
      return res.status(404).json({
        title: "Not Found",
        message: "Course not found or you don't have permission to view it",
        details: { courseId: courseId }
      });
    }

    return res.status(200).json({
      title: "Course Found",
      message: "Course retrieved successfully",
      course
    });

  } catch (error: any) {
    console.error("Get course error:", error);
    
    // Handle specific errors from Better-Auth
    if (error instanceof APIError) {
      return res.status(error.statusCode).json({
        title: "Authentication Error",
        message: error.message || "Failed to get course",
        details: { errorCode: error.statusCode, errorType: error.status }
      });
    }

    // Generic error handler
    return res.status(500).json({
      title: "Server Error",
      message: "An error occurred while retrieving the course",
      details: process.env.ENVIRONMENT === "DEVELOPMENT" ? { error: error.message } : undefined
    });
  }
};
