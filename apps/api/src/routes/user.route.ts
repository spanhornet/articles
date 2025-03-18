import express from 'express';
import { getUser, signIn, signUp, signOut } from '../controllers/user.controller';

const router = express.Router();

// Async handler to catch errors in async route handlers
const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get current user
router.get('/', asyncHandler(getUser));

// Authentication routes
router.post('/sign-in', asyncHandler(signIn));
router.post('/sign-up', asyncHandler(signUp));
router.post('/sign-out', asyncHandler(signOut));

export { router as userRouter };