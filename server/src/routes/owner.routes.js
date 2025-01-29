import { Router } from "express";
import {
    registerOwner,
    loginOwner,
    logoutOwner,
    refreshAccessToken,
    changeCurrentOwnerPassword,
    getCurrentOwner,
    updateAccountDetails,
    getOwnerProfile,
    deleteOwner
} from "../controllers/owner.controller.js";
import { upload } from "../middlewares/multer.middleware.js"; //used for uploading files
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), registerOwner);
router.route("/login").post(loginOwner);

//Secured Routes

router.route("/logout").post(verifyJWT ,logoutOwner);
router.route("/refresh-token").post(verifyJWT, refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentOwnerPassword);
router.route("/current-owner").get(verifyJWT, getCurrentOwner);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router.route("/profile").get(verifyJWT, getOwnerProfile);
router.route("/delete").delete(verifyJWT, deleteOwner);

export default router;