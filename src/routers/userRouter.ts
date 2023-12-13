import * as express from "express";

import {
  createUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} from "../controllers/userController";
import { upload } from "../services/upload";

const userRouter = express.Router();

userRouter.post("/", upload.single("avatar"), createUser);
userRouter.get("/", getAllUsers);
userRouter.get("/:userId", getUserById);
userRouter.put("/:userId", upload.single("avatar"), updateUserById);
userRouter.delete("/:userId", deleteUserById);

export default userRouter;
