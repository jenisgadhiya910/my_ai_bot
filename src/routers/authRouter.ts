import * as express from "express";

import {
  login,
  signup,
  forgotPassword,
  resetPassword,
} from "../controllers/authController";

const authRouter = express.Router();

authRouter.post("/login", login);

authRouter.post("/signup", signup);

authRouter.post("/forgot-password", forgotPassword);

authRouter.post("/reset-password", resetPassword);

export default authRouter;
