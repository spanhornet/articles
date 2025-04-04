import express from "express";
import { createArtwork, updateArtwork, getArtworksByCourse, deleteArtwork } from "../controllers/artwork.controller";

const router = express.Router();

const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post("/", asyncHandler(createArtwork));
router.put("/:id", asyncHandler(updateArtwork));
router.get("/course/:courseId", asyncHandler(getArtworksByCourse));
router.delete("/:id", asyncHandler(deleteArtwork));

export { router as artworkRouter };
