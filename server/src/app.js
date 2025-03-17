import express, { urlencoded } from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json({limit : "16kb"}));

app.use(urlencoded({extended: true, limit : "16kb"}));

app.use(express.static("public"));

app.use(cookieParser());

const allowedOrigins = [
    'http://localhost:5173',
    'https://northern-delight.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Allowed headers
    credentials: true // Allow cookies and authentication headers
}));

//routes

import ownerRouter from "./routes/owner.routes.js"
import employeeRouter from "./routes/employee.routes.js"
import activityLoggerRouter from "./routes/activityLogger.routes.js"
import ownerDashboardRouter from "./routes/ownerDashboard.routes.js"
import foodCategoryRouter from "./routes/foodCategory.routes.js"
import foodItemRouter from "./routes/foodItem.routes.js"

// routes declaration

app.use("/api/owner", ownerRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/activity-logger", activityLoggerRouter);
app.use("/api/owner-dashboard", ownerDashboardRouter);
app.use("/api/food-category", foodCategoryRouter);
app.use("/api/food-item", foodItemRouter);


// Secured routes

export { app };