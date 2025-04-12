// Express
import express from "express";

// Controllers
import {
  markArtworkAsCompleted,
  getArtworkProgress
} from "../controllers/artworkProgress.controller";

// Router
const router = express.Router();

// Async Handler
const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Mark artwork as completed
router.put("/:artworkId/complete", asyncHandler(markArtworkAsCompleted));

// Get artwork progress for a course
router.get("/course/:courseId", asyncHandler(getArtworkProgress));

export { router as artworkProgressRouter }; 