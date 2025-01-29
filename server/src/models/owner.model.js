import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const ownerSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        phoneNumber: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        avatar: {
            type: {
                url: { type: String, required: true },
                public_id: { type: String, required: false, default: null },
                resource_type: { type: String, default: "image" }, // Default resource type
            },
            default: null,
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

ownerSchema.pre("save", async function (next) {

    if (!this.isModified("password")) return next(); //run only if password is modified

    this.password = await bcrypt.hash(this.password, 10);
    next();
})

ownerSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

ownerSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            phoneNumber: this.phoneNumber,
            username: this.username,
            name: this.name,
            avatar: this.avatar,
            role: "owner"
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

ownerSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const Owner = mongoose.model("Owner", ownerSchema)