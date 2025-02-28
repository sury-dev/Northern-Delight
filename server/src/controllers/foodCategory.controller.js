import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Employee } from "../models/employee.model.js";
import { Owner } from "../models/owner.model.js";
import { FoodCategory } from "../models/foodCategory.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs";
import jwt from "jsonwebtoken";
import ActivityLogger, { addLog } from "../utils/activityLogger.js";
import mongoose from "mongoose";

const userType = "owner";

const createFoodCategory = asyncHandler(async (req, res) => {
    try {

        if (req.role !== userType) {
            throw new ApiError(403, "Unauthorized access");
        }

        const { categoryName, categoryDescription } = req.body;

        if ([categoryName, categoryDescription].some((field) => field?.trim() === "")) {
            throw new ApiError(400, "Please provide all required fields");
        }

        
        const existingCategory = await FoodCategory.findOne({
            categoryName: { $regex: new RegExp(`^${categoryName}$`, "i") }
        });
        
        if (existingCategory) {
            throw new ApiError(400, "Category already exists");
        }
        
        const category = await FoodCategory.create({
            categoryName,
            categoryDescription,
        });

        res.status(201).json(new ApiResponse("Category created successfully", category));
    } catch (error) {
        return res.status(error?.statusCode || 500).json(
            new ApiResponse(error?.statusCode || 500, {}, error?.message || "Something went wrong while creating category")
        )
    }
});

const getFoodCategories = asyncHandler(async (req, res) => {
    try {
        if (req?.role !== userType) {
            throw new ApiError(401, "Unauthorized Request");
        }

        const categories = await FoodCategory.find();
        res.status(200).json(new ApiResponse("Categories fetched successfully", categories));
    } catch (error) {
        return res.status(error?.statusCode || 500).json(
            new ApiResponse(error?.statusCode || 500, {}, error?.message || "Something went wrong while fetching categories")
        )
    }
});

const updateFoodCategory = asyncHandler(async (req, res) => {
    try {
        if (!req.role || req.role !== userType) {
            throw new ApiError(401, "Unauthorized Request");
        }

        if (!req.params.id || !mongoose.isValidObjectId(req.params.id)) {
            throw new ApiError(400, "Invalid category ID");
        }

        const { categoryName, categoryDescription } = req.body;

        console.log("categoryName: ", categoryName, "categoryDescription: ", categoryDescription);

        // At least one field should be provided
        if (!categoryName && !categoryDescription) {
            throw new ApiError(400, "Please provide at least one field to update");
        }

        if (categoryName && categoryName.trim() === "") {
            throw new ApiError(400, "Category Name cannot be empty");
        }

        if (categoryDescription && categoryDescription.trim() === "") {
            throw new ApiError(400, "Category Description cannot be empty");
        }

        const category = await FoodCategory.findById(req.params.id);
        if (!category) {
            throw new ApiError(404, "Category not found");
        }

        // Check for duplicate category name only if it's being updated
        if (categoryName && categoryName.toLowerCase() !== category.categoryName.toLowerCase()) {
            const existingCategory = await FoodCategory.findOne({
                categoryName: { $regex: new RegExp(`^${categoryName}$`, "i") }
            });

            if (existingCategory) {
                throw new ApiError(400, "Category Name already exists");
            }
        }

        category.categoryName = categoryName || category.categoryName;
        category.categoryDescription = categoryDescription || category.categoryDescription;

        const updatedCategory = await category.save();
        res.status(200).json(new ApiResponse("Category updated successfully", updatedCategory));
    } catch (error) {
        return res.status(error?.statusCode || 500).json(
            new ApiResponse(error?.statusCode || 500, {}, error?.message || "Something went wrong while updating category")
        )
    }
});


const deleteFoodCategory = asyncHandler(async (req, res) => {
    try {
        if (req?.role !== userType) {
            throw new ApiError(401, "Unauthorized Request");
        }

        if(!req.params.id || !mongoose.isValidObjectId(req.params.id)) {
            throw new ApiError(400, "Invalid category id");
        }

        const category = await FoodCategory.findById(req.params.id);

        if (!category) {
            throw new ApiError(404, "Category not found");
        }

        const deletedCategory = await category.remove();
        if (!deletedCategory) {
            return next(new ApiError("Failed to delete category", 500));
        }

        res.status(200).json(new ApiResponse("Category deleted successfully", deletedCategory));
    } catch (error) {
        return res.status(error?.statusCode || 500).json(
            new ApiResponse(error?.statusCode || 500, {}, error?.message || "Something went wrong while deleting category")
        )
    }
});

export { createFoodCategory, getFoodCategories, updateFoodCategory, deleteFoodCategory };