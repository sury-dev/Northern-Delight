import mongoose from "mongoose";

const foodComboSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        foodItems: [
            {
                item: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "FoodItem",
                    required: true,
                },
                quantity: {
                    type: Number,
                    default: 1,
                    min: 1,
                },
            },
        ],
        ingredients: {
            type: [String],
            required: true,
            default: [],
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        profit: {
            type: Number,
            default: 0,
        },
        investmentAmount: {
            type: Number, // Total cost of making the combo
            required: true,
            min: 0,
            default: 0,
        },
        availability: {
            type: Boolean,
            default: true,
        },
        imageUrl: {
            type: {
                url: { type: String, required: false, default: null },
                public_id: { type: String, required: false, default: null },
                resource_type: { type: String, default: "image" },
            },
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// ✅ Fix: Populate Food Items before saving
foodComboSchema.pre("save", async function (next) {
    await this.populate("foodItems.item"); // Populate food item data

    let totalInvestment = 0;
    let ingredientsSet = new Set(this.ingredients); // Ensure unique ingredients

    this.foodItems.forEach(({ item, quantity }) => {
        if (item && item.investmentAmount && item.ingredients) {
            totalInvestment += item.investmentAmount * quantity;
            item.ingredients.forEach((ingredient) => ingredientsSet.add(ingredient));
        }
    });

    this.investmentAmount = totalInvestment;
    this.ingredients = [...ingredientsSet]; // Convert Set back to an array
    this.profit = this.price - this.investmentAmount;

    next();
});

const FoodCombo = mongoose.model("FoodCombo", foodComboSchema);
export default FoodCombo;
