// Express
import express from "express";

// Controllers
import {
  createCourse,
  getCourseById,
  updateCourse
} from "../controllers/course.controller";

// Router
const router = express.Router();

// Async Handler
const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get a course by ID
router.get("/:courseId", asyncHandler(getCourseById));

// Create a course
router.post("/", asyncHandler(createCourse));

// Update a course
router.put("/:courseId", asyncHandler(updateCourse));

export { router as courseRouter };