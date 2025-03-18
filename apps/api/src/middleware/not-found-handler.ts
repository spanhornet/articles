import { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(404).json({
    status: 'error',
    statusCode: 404,
    message: `Not Found - ${req.originalUrl}`
  });
};