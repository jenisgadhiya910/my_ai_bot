import * as express from "express";

import {
  createHistory,
  getAllHistories,
  getHistoryById,
  updateHistoryById,
  deleteHistoryById,
} from "../controllers/historyController";

const historyRouter = express.Router();

historyRouter.post("/", createHistory);
historyRouter.get("/", getAllHistories);
historyRouter.get("/:historyId", getHistoryById);
historyRouter.put("/:historyId", updateHistoryById);
historyRouter.delete("/:historyId", deleteHistoryById);

export default historyRouter;
