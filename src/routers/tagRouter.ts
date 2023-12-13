import * as express from "express";

import {
  createTag,
  getAllTags,
  getTagById,
  updateTagById,
  removeTagById,
} from "../controllers/tagController";

const tagRouter = express.Router();

tagRouter.post("/", createTag);
tagRouter.get("/", getAllTags);
tagRouter.get("/:tagId", getTagById);
tagRouter.put("/:tagId", updateTagById);
tagRouter.delete("/:tagId", removeTagById);

export default tagRouter;
