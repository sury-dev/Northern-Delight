import mongoose from "mongoose";

const foodCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    }
},
{
    timestamps: true,
});

export const FoodCategory = mongoose.model("FoodCategory", foodCategorySchema);
