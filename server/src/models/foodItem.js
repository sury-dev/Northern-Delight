import mongoose from "mongoose";

const foodItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FoodCategory",
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    investmentAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    profit: {
        type: Number,
        default: 0,
    },
    ingredients: {
        type: [String], // Example: ["Cheese", "Tomato", "Basil"]
        required: true,
    },
    availability: {
        type: Boolean,
        default: true,
    },
    imageUrl: {
        type: {
            url: { type: String, required: true },
            public_id: { type: String, required: false, default: null },
            resource_type: { type: String, default: "image" }, // Default resource type
        },
        default: null,
    },
},
{
    timestamps: true,
});

foodItemSchema.pre("save", function(next) {
    this.profit = this.price - this.investmentAmount;
    //split the im
    next();
});

const FoodItem = mongoose.model("FoodItem", foodItemSchema);
