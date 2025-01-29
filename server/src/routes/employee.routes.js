import { Router } from "express";
import {
    registerEmployee,
    loginEmployee,
    logoutEmployee,
    refreshAccessToken,
    changeCurrentEmployeePassword,
    getCurrentEmployee,
    updateAccountDetails,
    getEmployeeProfile,
    deleteEmployee
} from "../controllers/employee.controller.js";
import { upload } from "../middlewares/multer.middleware.js"; //used for uploading files
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), registerEmployee);
router.route("/login").post(loginEmployee);

//Secured Routes

router.route("/logout").post(verifyJWT ,logoutEmployee);
router.route("/refresh-token").post(verifyJWT, refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentEmployeePassword);
router.route("/current-employee").get(verifyJWT, getCurrentEmployee);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router.route("/profile").get(verifyJWT, getEmployeeProfile);
router.route("/delete").delete(verifyJWT, deleteEmployee);

export default router;