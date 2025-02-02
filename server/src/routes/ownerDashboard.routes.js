import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js"; //used for uploading files
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleEmployeeActivation, fetchAllEmployees, deleteEmployee } from "../controllers/ownerDashboard.controller.js";

const router = Router();

router.route("/toggle-employee-activation/:id").patch(verifyJWT, toggleEmployeeActivation);
router.route("/get-all-employees").get(verifyJWT, fetchAllEmployees);
router.route("/delete-employee/:id").delete(verifyJWT, deleteEmployee);

export default router;