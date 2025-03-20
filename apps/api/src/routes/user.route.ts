import express from 'express';
import { getUser, signIn, signUp, signOut } from '../controllers/user.controller';

const router = express.Router();

// Async handler to catch errors in async route handlers
const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get the currently authenticated user
router.get('/', asyncHandler(getUser));

// Sign in an existing user
router.post('/sign-in', asyncHandler(signIn));

// Register a new user
router.post('/sign-up', asyncHandler(signUp));

// Sign out the current user
router.post('/sign-out', asyncHandler(signOut));

export { router as userRouter };