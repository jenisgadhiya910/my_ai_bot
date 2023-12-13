import * as express from "express";

import { chat, chatHistoryByHistoryId } from "../controllers/ChatController";

const chatRouter = express.Router();

chatRouter.post("/", chat);
chatRouter.get("/history/:historyId", chatHistoryByHistoryId);

export default chatRouter;
