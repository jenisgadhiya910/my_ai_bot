import { AppDataSource } from "./database/data-source";
import * as express from "express";
import * as cors from "cors";
import * as path from "path";
import * as bodyParser from "body-parser";
import authRouter from "./routers/authRouter";
import userRouter from "./routers/userRouter";
import promptRouter from "./routers/promptRouter";
import historyRouter from "./routers/historyRouter";
import settingRouter from "./routers/settingRouter";
import chatRouter from "./routers/chatRouter";
import { authMiddleware } from "./middlewares/authMiddleware";
import { seedUser } from "./database/seeders/userSeeder";
import tagRouter from "./routers/tagRouter";
import documentRouter from "./routers/documentRouter";
import * as dotenv from "dotenv";
import companyRouter from "./routers/companyRouter";
dotenv.config();

const app = express();
const port = 4000;

app.use(express.json());

const corsOrigin = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOrigin));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRouter);
app.use("/api/users", authMiddleware, userRouter);
app.use("/api/prompts", authMiddleware, promptRouter);
app.use("/api/history", authMiddleware, historyRouter);
app.use("/api/settings", authMiddleware, settingRouter);
app.use("/api/chats", authMiddleware, chatRouter);
app.use("/api/tags", authMiddleware, tagRouter);
app.use("/api/documents", authMiddleware, documentRouter);
app.use("/api/company", authMiddleware, companyRouter);

AppDataSource.initialize()
  .then(async () => {
    console.log("Database connected!!!");
    app.listen(port, () => {
      console.log(`app is running on ${port}`);
      seedUser();
    });
  })
  .catch((error) => console.log(error));
