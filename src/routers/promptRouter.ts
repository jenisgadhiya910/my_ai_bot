import * as express from "express";

import {
  createPrompt,
  getAllPrompts,
  getPromptById,
  updatePromptById,
  deletePromptById,
} from "../controllers/promptController";
import { upload } from "../services/upload";

const promptRouter = express.Router();

promptRouter.post("/", upload.single("icon"), createPrompt);
promptRouter.get("/", getAllPrompts);
promptRouter.get("/:promptId", getPromptById);
promptRouter.put("/:promptId", upload.single("icon"), updatePromptById);
promptRouter.delete("/:promptId", deletePromptById);

export default promptRouter;
