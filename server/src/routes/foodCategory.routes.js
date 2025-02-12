import { Router } from "express";
import { createFoodCategory, getFoodCategories, updateFoodCategory, deleteFoodCategory } from "../controllers/foodCategory.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create").post(verifyJWT, createFoodCategory);
router.route("/fetch").get(verifyJWT, getFoodCategories);
router.route("/update/:id").patch(verifyJWT, updateFoodCategory);
router.route("/delete/:id").delete(verifyJWT, deleteFoodCategory);

export default router;