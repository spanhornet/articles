import express, { Request, Response } from 'express';
import { getUser } from '../controllers/user.controller';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    const user = await getUser(req, res);
    res.json(user);
});

export { router as userRouter };
