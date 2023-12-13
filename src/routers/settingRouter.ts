import * as express from "express";

import {
  createSetting,
  getAllSettings,
  getSettingById,
  updateSettingById,
  deleteSettingById,
} from "../controllers/settingController";

const settingRouter = express.Router();

settingRouter.post("/", createSetting);
settingRouter.get("/", getAllSettings);
settingRouter.get("/:settingId", getSettingById);
settingRouter.put("/:settingId", updateSettingById);
settingRouter.delete("/:settingId", deleteSettingById);

export default settingRouter;
