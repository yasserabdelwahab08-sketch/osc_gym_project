import express from "express";
import cookieParser from "cookie-parser";
import router from "./routes/usersRoutes";
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use("/api/users", router);

export default app;