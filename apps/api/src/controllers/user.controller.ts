import { Request, Response } from 'express';

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = {
      id: 'dummy-id-123',
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '123-456-7890',
      role: 'STUDENT',
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return res.status(200).json({
      user: user
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'An error occurred while retrieving the user' });
  }
};
