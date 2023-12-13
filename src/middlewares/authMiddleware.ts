import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the JWT token from the request headers
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Authentication required.",
        success: false,
      });
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, "your-secret-key") as { userId: number };

    // Add the userId to the request object for further use
    //@ts-ignore
    req.userId = decoded.userId;

    next();
  } catch (error) {
    res.status(401).json({
      message: "Invalid token.",
      success: false,
    });
  }
};
