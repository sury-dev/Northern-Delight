import { Router } from "express";
import {
    getActivityLogs
} from "../controllers/activityLogger.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/get-activity").get(verifyJWT ,getActivityLogs);

export default router;