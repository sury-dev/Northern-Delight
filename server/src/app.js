import express, { urlencoded } from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json({limit : "16kb"}));

app.use(urlencoded({extended: true, limit : "16kb"}));

app.use(express.static("public"));

app.use(cookieParser());

app.use(cors({
    origin : process.env.CORS_ORIGIN,
}))

//routes

import ownerRouter from "./routes/owner.routes.js"
import employeeRouter from "./routes/employee.routes.js"
import activityLoggerRouter from "./routes/activityLogger.routes.js"

// routes declaration

app.use("/api/owner", ownerRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/activity-logger", activityLoggerRouter);

// Secured routes

export { app };