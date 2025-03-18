import { Request, Response } from "express";

const healthController = (req: Request, res: Response) => {
  res.json({ status: "OK", message: "Server is running smoothly" });
};

export default healthController;