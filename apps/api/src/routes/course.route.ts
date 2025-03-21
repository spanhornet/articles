import express from 'express';
import { createCourse, getTeacherCourses, getCourse, updateCourse } from "../controllers/course.controller";

const router = express.Router();

// Async handler to catch errors in async route handlers
const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Create a new course
router.post('/', asyncHandler(createCourse));

// Get all courses for a teacher
router.get('/', asyncHandler(getTeacherCourses));

// Get a specific course
router.get('/:courseId', asyncHandler(getCourse));

// Update a course
router.put('/:courseId', asyncHandler(updateCourse));

export { router as courseRouter };