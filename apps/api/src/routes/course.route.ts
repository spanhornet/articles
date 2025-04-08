// Express
import express from "express";

// Controllers
import {
  createCourse,
  getCourseById,
  updateCourse,
  getAllCoursesByUserId,
  deleteCourse,
  updateCoursePublishStatus
} from "../controllers/course.controller";

// Router
const router = express.Router();

// Async Handler
const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get all courses for the current user
router.get("/", asyncHandler(getAllCoursesByUserId));

// Get a course by ID
router.get("/:courseId", asyncHandler(getCourseById));

// Create a course
router.post("/", asyncHandler(createCourse));

// Update a course
router.put("/:courseId", asyncHandler(updateCourse));

// Update course publish status
router.put("/:courseId/publish", asyncHandler(updateCoursePublishStatus));

// Delete a course
router.delete("/:courseId", asyncHandler(deleteCourse));

export { router as courseRouter };