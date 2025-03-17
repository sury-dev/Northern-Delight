import { Router } from "express";
import { createFoodItem, fetchFoodItems } from "../controllers/foodItem.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/create").post(verifyJWT, upload.single("image"), createFoodItem);
router.route("/fetch").get(verifyJWT, fetchFoodItems);
// router.route("/update/:id").patch(verifyJWT, updateFoodCategory);
// router.route("/delete/:id").delete(verifyJWT, deleteFoodCategory);

export default router;