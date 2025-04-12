// Express
import express from "express";

// Controllers
import {
  enrollInCourse,
  getStudentEnrollments
} from "../controllers/enrollment.controller";

// Router
const router = express.Router();

// Async Handler
const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Enroll in a course
router.post("/", asyncHandler(enrollInCourse));

// Get student enrollments
router.get("/", asyncHandler(getStudentEnrollments));

export { router as enrollmentRouter }; 