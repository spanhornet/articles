// Express
import { Request, Response } from "express";

// Drizzle ORM
import { db, schema } from "@repo/database";
import { eq, and, desc } from "drizzle-orm";

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
    const [course] = await db.insert(schema.courses).values({
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
    const [course] = await db.select().from(schema.courses)
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

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { title, description } = req.body;

    // Validate input
    if (!courseId) {
      return res.status(400).json({
        title: "Invalid Input",
        message: "Course ID is required",
        details: { missingFields: ["courseId"] }
      });
    }

    if (!title && !description) {
      return res.status(400).json({
        title: "Invalid Input",
        message: "At least one field (title or description) must be provided for update",
        details: { missingFields: ["title", "description"] }
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
        message: "You must be logged in to update a course",
        details: { reason: "no_session" }
      });
    }

    // First check if the course exists and belongs to the user
    const [existingCourse] = await db.select().from(schema.courses)
      .where(and(
        eq(schema.courses.id, courseId),
        eq(schema.courses.userId, session.user.id)
      ))
      .limit(1);

    // If course not found or doesn't belong to user
    if (!existingCourse) {
      return res.status(404).json({
        title: "Not Found",
        message: "Course not found or you don't have permission to update it",
        details: { courseId: courseId }
      });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    };

    // Only include fields that are provided in the request
    if (title) updateData.title = title;
    if (description) updateData.description = description;

    // Update the course in the database
    const [updatedCourse] = await db.update(schema.courses)
      .set(updateData)
      .where(and(
        eq(schema.courses.id, courseId),
        eq(schema.courses.userId, session.user.id)
      ))
      .returning();

    return res.status(200).json({
      title: "Course Updated",
      message: "Course has been updated successfully",
      course: updatedCourse
    });

  } catch (error: any) {
    console.error("Update course error:", error);

    // Handle specific errors from Better-Auth
    if (error instanceof APIError) {
      return res.status(error.statusCode).json({
        title: "Authentication Error",
        message: error.message || "Failed to update course",
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
      message: "An error occurred while updating the course",
      details: process.env.ENVIRONMENT === "DEVELOPMENT" ? { error: error.message } : undefined
    });
  }
};

export const updateCoursePublishStatus = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { isPublished } = req.body;

    // Validate input
    if (!courseId) {
      return res.status(400).json({
        title: "Invalid Input",
        message: "Course ID is required",
        details: { missingFields: ["courseId"] }
      });
    }

    if (typeof isPublished !== 'boolean') {
      return res.status(400).json({
        title: "Invalid Input",
        message: "isPublished must be a boolean value",
        details: { invalidFields: ["isPublished"] }
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
        message: "You must be logged in to update a course",
        details: { reason: "no_session" }
      });
    }

    // First check if the course exists and belongs to the user
    const [existingCourse] = await db.select().from(schema.courses)
      .where(and(
        eq(schema.courses.id, courseId),
        eq(schema.courses.userId, session.user.id)
      ))
      .limit(1);

    // If course not found or doesn't belong to user
    if (!existingCourse) {
      return res.status(404).json({
        title: "Not Found",
        message: "Course not found or you don't have permission to update it",
        details: { courseId: courseId }
      });
    }

    // Update the course's publish status
    const [updatedCourse] = await db.update(schema.courses)
      .set({
        isPublished,
        publishedAt: isPublished ? new Date() : null,
        updatedAt: new Date()
      })
      .where(and(
        eq(schema.courses.id, courseId),
        eq(schema.courses.userId, session.user.id)
      ))
      .returning();

    return res.status(200).json({
      title: "Course Updated",
      message: `Course has been ${isPublished ? 'published' : 'unpublished'} successfully`,
      course: updatedCourse
    });

  } catch (error: any) {
    console.error("Update course publish status error:", error);

    // Handle specific errors from Better-Auth
    if (error instanceof APIError) {
      return res.status(error.statusCode).json({
        title: "Authentication Error",
        message: error.message || "Failed to update course publish status",
        details: { errorCode: error.statusCode, errorType: error.status }
      });
    }

    // Generic error handler
    return res.status(500).json({
      title: "Server Error",
      message: "An error occurred while updating the course publish status",
      details: process.env.ENVIRONMENT === "DEVELOPMENT" ? { error: error.message } : undefined
    });
  }
};

export const getAllCoursesByUserId = async (req: Request, res: Response) => {
  try {
    // Get the authenticated user session
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    // If no session, return unauthorized
    if (!session || !session.user) {
      return res.status(401).json({
        title: "Authentication Required",
        message: "You must be logged in to view courses",
        details: { reason: "no_session" }
      });
    }

    // Get all courses for the user
    const courses = await db.select({
      id: schema.courses.id,
      title: schema.courses.title,
      description: schema.courses.description,
      createdAt: schema.courses.createdAt,
      updatedAt: schema.courses.updatedAt,
      isPublished: schema.courses.isPublished
    })
      .from(schema.courses)
      .where(eq(schema.courses.userId, schema.user.id))
      .orderBy(desc(schema.courses.createdAt));

    // If there are no courses, return early with empty array
    if (courses.length === 0) {
      return res.status(200).json({
        title: "Courses Found",
        message: "No courses found",
        courses: []
      });
    }

    // Get artworks for each course
    const coursesWithArtworks = await Promise.all(
      courses.map(async (course) => {
        // Get artworks for this specific course
        const artworks = await db.select({
          id: schema.artworks.id,
          title: schema.artworks.title,
          description: schema.artworks.description,
          coverImage: schema.artworks.coverImage,
          createdAt: schema.artworks.createdAt,
          updatedAt: schema.artworks.updatedAt,
          courseId: schema.artworks.courseId
        })
          .from(schema.artworks)
          .where(eq(schema.artworks.courseId, course.id))
          .orderBy(schema.artworks.createdAt);

        // Return course with its artworks
        return {
          ...course,
          artworksCount: artworks.length,
          artworks
        };
      })
    );

    return res.status(200).json({
      title: "Courses Found",
      message: "Courses retrieved successfully",
      courses: coursesWithArtworks
    });

  } catch (error: any) {
    console.error("Get courses error:", error);

    // Handle specific errors from Better-Auth
    if (error instanceof APIError) {
      return res.status(error.statusCode).json({
        title: "Authentication Error",
        message: error.message || "Failed to get courses",
        details: { errorCode: error.statusCode, errorType: error.status }
      });
    }

    // Generic error handler
    return res.status(500).json({
      title: "Server Error",
      message: "An error occurred while retrieving the courses",
      details: process.env.ENVIRONMENT === "DEVELOPMENT" ? { error: error.message } : undefined
    });
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
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
        message: "You must be logged in to delete a course",
        details: { reason: "no_session" }
      });
    }

    // First check if the course exists and belongs to the user
    const [existingCourse] = await db.select().from(schema.courses)
      .where(and(
        eq(schema.courses.id, courseId),
        eq(schema.courses.userId, session.user.id)
      ))
      .limit(1);

    // If course not found or doesn't belong to user
    if (!existingCourse) {
      return res.status(404).json({
        title: "Not Found",
        message: "Course not found or you don't have permission to delete it",
        details: { courseId: courseId }
      });
    }

    // Delete the course
    await db.delete(schema.courses)
      .where(and(
        eq(schema.courses.id, courseId),
        eq(schema.courses.userId, session.user.id)
      ));

    return res.status(200).json({
      title: "Course Deleted",
      message: "Course has been deleted successfully",
      courseId
    });

  } catch (error: any) {
    console.error("Delete course error:", error);

    // Handle specific errors from Better-Auth
    if (error instanceof APIError) {
      return res.status(error.statusCode).json({
        title: "Authentication Error",
        message: error.message || "Failed to delete course",
        details: { errorCode: error.statusCode, errorType: error.status }
      });
    }

    // Generic error handler
    return res.status(500).json({
      title: "Server Error",
      message: "An error occurred while deleting the course",
      details: process.env.ENVIRONMENT === "DEVELOPMENT" ? { error: error.message } : undefined
    });
  }
};

export const getAllPublishedCourses = async (req: Request, res: Response) => {
  try {
    // Get all published courses
    const courses = await db.select()
      .from(schema.courses)
      .where(eq(schema.courses.isPublished, true))
      .orderBy(desc(schema.courses.publishedAt || schema.courses.createdAt));

    // Get artworks for each course
    const coursesWithArtworks = await Promise.all(
      courses.map(async (course) => {
        // Get artworks for this specific course
        const artworks = await db.select({
          id: schema.artworks.id,
          title: schema.artworks.title,
          description: schema.artworks.description,
          coverImage: schema.artworks.coverImage,
          createdAt: schema.artworks.createdAt
        })
          .from(schema.artworks)
          .where(eq(schema.artworks.courseId, course.id))
          .orderBy(schema.artworks.createdAt);

        // Get teacher info
        const [teacher] = await db.select({
          id: schema.users.id,
          name: schema.users.name
        })
          .from(schema.users)
          .where(eq(schema.users.id, course.userId))
          .limit(1);

        // Return course with its artworks and teacher info
        return {
          ...course,
          artworksCount: artworks.length,
          artworks: artworks.length > 0 ? [artworks[0]] : [], // Only return first artwork as preview
          teacher: teacher || { name: "Unknown Teacher" }
        };
      })
    );

    return res.status(200).json({
      title: "Published Courses",
      message: "All published courses retrieved successfully",
      courses: coursesWithArtworks
    });

  } catch (error: any) {
    console.error("Get published courses error:", error);

    // Generic error handler
    return res.status(500).json({
      title: "Server Error",
      message: "An error occurred while retrieving published courses",
      details: process.env.ENVIRONMENT === "DEVELOPMENT" ? { error: error.message } : undefined
    });
  }
};
