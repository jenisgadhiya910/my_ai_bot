import * as express from "express";

import {
  createDocument,
  getAllDocuments,
  getDocumentById,
  updateDocumentById,
  removeDocumentById,
} from "../controllers/documentController";
import { upload } from "../services/upload";

const documentRouter = express.Router();

documentRouter.post("/", upload.single("document_file"), createDocument);
documentRouter.get("/", getAllDocuments);
documentRouter.get("/:documentId", getDocumentById);
documentRouter.put(
  "/:documentId",
  upload.single("document_file"),
  updateDocumentById
);
documentRouter.delete("/:documentId", removeDocumentById);

export default documentRouter;
