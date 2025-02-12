import mongoose from "mongoose";

const foodCategorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    categoryDescription: {
        type: String,
        trim: true,
    }
},
{
    timestamps: true,
});

export const FoodCategory = mongoose.model("FoodCategory", foodCategorySchema);
