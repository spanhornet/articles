import { Request, Response } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { db, schema } from '@repo/database';
import { eq } from 'drizzle-orm';
import { auth } from '../auth';
import { randomUUID } from 'crypto';

// Create a new course
export const createCourse = async (req: Request, res: Response) => {
  try {
    // Get the authenticated user session
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    // Check if user is authenticated
    if (!session || !session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if user is a teacher
    if (session.user.role !== 'TEACHER') {
      return res.status(403).json({ message: 'Only teachers can create courses' });
    }

    // Extract the request body
    const { teacherId, teacherName } = req.body;

    // Create a new course
    const newCourse = {
        id: randomUUID(),
        title: "",
        description: "",
        teacherId: teacherId,
        teacherName: teacherName,
        isPublished: false,
    };

    // Insert the course into the database
    await db.insert(schema.courses).values(newCourse);

    // Return the new course
    return res.status(201).json(newCourse);
  } catch (error: any) {
    console.error('Create course error:', error);
    return res.status(500).json({ message: error.message || 'An error occurred while creating the course' });
  }
};

// Get all courses for a teacher
export const getTeacherCourses = async (req: Request, res: Response) => {
  try {
    // Get the authenticated user session
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    // Check if user is authenticated
    if (!session || !session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get courses for the authenticated teacher
    const courses = await db.select().from(schema.courses)
      .where(eq(schema.courses.teacherId, session.user.id));

    return res.status(200).json({ courses });
  } catch (error: any) {
    console.error('Get courses error:', error);
    return res.status(500).json({ message: error.message || 'An error occurred while fetching courses' });
  }
};

// Get a specific course
export const getCourse = async (req: Request, res: Response) => {
  try {
    // Get the authenticated user session
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    // Check if user is authenticated
    if (!session || !session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { courseId } = req.params;

    // Get the course
    const course = await db.select().from(schema.courses)
      .where(eq(schema.courses.id, courseId))
      .limit(1);

    if (!course || course.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if the user is the teacher of the course or an admin
    if (course[0].teacherId !== session.user.id && session.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'You do not have permission to view this course' });
    }

    return res.status(200).json(course[0]);
  } catch (error: any) {
    console.error('Get course error:', error);
    return res.status(500).json({ message: error.message || 'An error occurred while fetching the course' });
  }
};