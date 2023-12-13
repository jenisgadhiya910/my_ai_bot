import * as express from "express";

import {
  getAllCompanies,
  getCompanyById,
} from "../controllers/companyController";

const companyRouter = express.Router();

companyRouter.get("/", getAllCompanies);
companyRouter.get("/:companyId", getCompanyById);

export default companyRouter;
