import express from "express";
import { uploadImage, deleteImage } from "../controllers/image.controller";

const router = express.Router();

// Async Handler
const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Upload an image
router.post("/upload", asyncHandler(uploadImage));

// Delete an image
router.post("/delete", asyncHandler(deleteImage));

export { router as imageRouter };