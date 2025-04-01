// apps/api/src/controllers/image.controller.ts
import { Request, Response } from 'express';
import multer from 'multer';
import { uploadImageToR2, deleteImageFromR2 } from '../services/image.service';
import { auth } from "../auth";
import { fromNodeHeaders } from "better-auth/node";

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export const uploadImage = (req: Request, res: Response) => {
  upload.single('image')(req, res, async (err) => {
    try {
      if (err) {
        return res.status(400).json({
          title: "Upload Error",
          message: err.message,
          details: { error: err.message }
        });
      }

      if (!req.file) {
        return res.status(400).json({
          title: "Invalid Input",
          message: "No image file was provided",
          details: { missingFields: ["image"] }
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
          message: "You must be logged in to upload images",
          details: { reason: "no_session" }
        });
      }

      // Upload the image to R2
      const imageUrl = await uploadImageToR2(
        req.file.buffer,
        req.file.mimetype,
        req.headers
      );

      return res.status(201).json({
        title: "Image Uploaded",
        message: "Image has been uploaded successfully",
        imageUrl
      });
    } catch (error: any) {
      console.error("Image upload error:", error);
      return res.status(500).json({
        title: "Server Error",
        message: error.message || "An error occurred while uploading the image",
        details: process.env.ENVIRONMENT === "DEVELOPMENT" ? { error: error.message } : undefined
      });
    }
  });
};

export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        title: "Invalid Input",
        message: "Image URL is required",
        details: { missingFields: ["imageUrl"] }
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
        message: "You must be logged in to delete images",
        details: { reason: "no_session" }
      });
    }

    // Delete the image from R2
    await deleteImageFromR2(imageUrl, req.headers);

    return res.status(200).json({
      title: "Image Deleted",
      message: "Image has been deleted successfully"
    });
  } catch (error: any) {
    console.error("Image delete error:", error);
    return res.status(500).json({
      title: "Server Error",
      message: error.message || "An error occurred while deleting the image",
      details: process.env.ENVIRONMENT === "DEVELOPMENT" ? { error: error.message } : undefined
    });
  }
};