import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { FoodCategory } from "../models/foodCategory.model.js";
import { FoodItem } from "../models/foodItem.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { addLog } from "../utils/activityLogger.js";
import fs from "fs";
import mongoose from "mongoose";

const userType = "owner";

const createFoodItem = asyncHandler(async (req, res) => {
    try {
        if (req.role !== userType) {
            throw new ApiError(403, "Unauthorized access");
        }

        const { name, description, category, price, investmentAmount, ingredients, availability } = req.body;

        if (!name || !description || !price || !investmentAmount) {
            throw new ApiError(400, "All fields are required");
        }

        if (!ingredients || ingredients.length === 0) {
            throw new ApiError(400, "At least one ingredient is required");
        }

        if (category && !mongoose.isValidObjectId(category)) {
            throw new ApiError(400, "Invalid category id");
        }

        const categoryExists = await FoodCategory.findById(category);
        if (!categoryExists) {
            throw new ApiError(404, "Category not found");
        }

        const foodItemExists = await FoodItem.findOne({
            name: { $regex: new RegExp(`^${name}$`, "i") }
        });

        if (foodItemExists) {
            throw new ApiError(400, "Food item already exists");
        }

        if (!req.file?.path) {
            throw new ApiError(400, "Image is required");
        }

        const imageObj = await uploadOnCloudinary(req.file.path, "foodItems");
        const imageUrl = imageObj?.url;

        const foodItem = await FoodItem.create({
            name,
            description,
            category,
            price,
            investmentAmount,
            profit: price - investmentAmount,
            ingredients,
            availability: Boolean(availability), // Ensure boolean value
            image: {
                url: imageUrl,
                public_id: imageObj?.public_id || null,
                resource_type: imageObj?.resource_type || "image"
            }
        });

        try {
            await addLog({
                userType,
                userId: req.owner?._id,
                details: {
                    foodItemId: foodItem._id,
                    foodItemName: foodItem.name
                },
                action: "New Food Item Added",
                ipAddress: req.ip
            });
        } catch (error) {
            console.error("Error while adding log entry for food item addition:", error);
        }

        return res.status(201).json(
            new ApiResponse(201, foodItem, "Food item created successfully")
        );
    } catch (error) {
        if(req.file?.path){
            fs.unlinkSync(req.file.path);
        }
        return res.status(error?.statusCode || 500).json(
            new ApiResponse(error?.statusCode || 500, {}, error?.message || "Something went wrong while creating food item")
        );
    }
});

const fetchFoodItems = asyncHandler(async (req, res) => {
    try {
        if (req.role !== userType) {
            throw new ApiError(403, "Unauthorized access");
        }
        const foodItems = await FoodItem.find().sort({ createdAt: -1 });
        return res.status(200).json(new ApiResponse(200, foodItems, "Food items fetched successfully"));
    } catch (error) {
        new ApiResponse(error?.statusCode || 500, {}, error?.message || "Something went wrong while fetching food items")
    }
});

export { createFoodItem, fetchFoodItems };
