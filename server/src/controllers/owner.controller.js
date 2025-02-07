import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Owner } from "../models/owner.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs";
import jwt from "jsonwebtoken";
import ActivityLogger, { addLog } from "../utils/activityLogger.js";

const userType = "owner";

const generateAccessAndRefreshToken = async (ownerId) => {
    try {

        const owner = await Owner.findById(ownerId);
        const accessToken = await owner.generateAccessToken();
        const refreshToken = await owner.generateRefreshToken();

        owner.refreshToken = refreshToken;
        await owner.save({validateBeforeSave : false});

        return { accessToken, refreshToken };
    } catch (error) {
        return res.status(error?.statusCode || 500).json(
            new ApiResponse(error?.statusCode || 500, {}, error?.message || "Something went wrong while generating tokens")
        )
    }
}

const registerOwner = asyncHandler(async (req, res) => {

    let avatarLocalPath;
    try {
        const { name, username, email, password, confirmPassword, phoneNumber, key, gender } = req.body;
    
        if (
            [name, username, email, password, phoneNumber, key, gender].some(
                (field) => field?.trim() === ""
            )
        ) {
            throw new ApiError(400, "All fields are required.");
        }
    
        const existingOwner = await Owner.findOne({
            $or: [{ username }, { email: email.toLowerCase() }]
        });
        
        if (existingOwner) {
            if (existingOwner.username === username) throw new ApiError(409, "Username already exists");
            if (existingOwner.email === email.toLowerCase()) throw new ApiError(409, "Email already exists");
        }
    
        if (password !== confirmPassword) {
            throw new ApiError(400, "Passwords do not match");
        }
    
        if(key !== process.env.OWNER_REGISTERATION_SECRET){
            throw new ApiError(401, "Invalid Key");
        }
    
        let avatar;
        let avatarObj;
    
        if (req.file?.path) {
            avatarLocalPath = req.file.path;
            avatarObj = await uploadOnCloudinary(avatarLocalPath, "owners"); // Upload to Cloudinary if a file exists
            avatar = avatarObj.url;
        } else {
            avatar = `https://avatar.iran.liara.run/public/${gender}?username=${username}`; // Default avatar URL
        }
    
        const owner = await Owner.create({
            name,
            email: email.toLowerCase(),
            username: username.trim(),
            password,
            phoneNumber: phoneNumber.trim(),
            avatar : {
                url : avatar,
                public_id : avatarObj?.public_id || null,
                resource_type : avatarObj?.resource_type || "image"
            } 
        });
    
        const createdOwner = await Owner.findById(owner._id).select(
            "-password -refreshToken"
        );
    
        if (!createdOwner) {
            throw new ApiError(500, "Something went wrong while registering the owner");
        }

        try {
            addLog({
                userType,
                userId : createdOwner._id,
                action : "Owner Registered",
                details : {
                    owner : createdOwner
                },
                ipAddress : req.ip
            });
        } catch (error) {
            console.log("Error while adding log entry for the new owner : ", error);
        } // Add a log entry for the new owner
    
        return res.status(201).json(
            new ApiResponse(201, createdOwner, "Owner registered successfully")
        );
    } catch (error) {
        if(avatarLocalPath){
            fs.unlinkSync(avatarLocalPath); // Delete the file from the server if an error occurs
        }
        return res.status(error?.statusCode || 500).json(
            new ApiResponse(error?.statusCode || 500, {}, error?.message || "Something went wrong while registering the owner")
        )
    }

})

const loginOwner = asyncHandler(async (req,res) => {

    try {
        const {usernameOrEmail, password} = req.body;
    
        if(!usernameOrEmail || !password){
            throw new ApiError(400, "Username Or Email along with corresponding password is required");
        }
    
        const owner = await Owner.findOne({ $or : [{username : usernameOrEmail}, {email : usernameOrEmail.toLowerCase()} ]});
    
        if(!owner){
            throw new ApiError(404, "Owner does not exist");
        }
    
        const isPasswordValid = await owner.isPasswordCorrect(password);
    
        if(!isPasswordValid){
            throw new ApiError(401, "Invalid Owner Credentials");
        }
    
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(owner._id);
    
        const loggedInOwner = await Owner.findById(owner._id).select("-password -refreshToken");
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        try {
            addLog({
                userType,
                userId : owner._id,
                action : "Owner Logged In",
                ipAddress : req.ip
            });
        } catch (error) {
            console.log("Error while adding log entry for owner login : ", error);
        }
    
        return res.
        status(200).
        cookie("accessToken", accessToken, options).
        cookie("refreshToken", refreshToken, options).
        json(
            new ApiResponse(
                200,
                {
                    owner: loggedInOwner, accessToken, refreshToken
                },
                "Owner Logged in successfully"
            )
        )
    } catch (error) {
        return res.status(error?.statusCode || 500).json(
            new ApiResponse(error?.statusCode || 500, {}, error?.message || "Something went wrong while logging in the owner")
        )
        
    }
})

const logoutOwner = asyncHandler(async (req, res) => {
    try {
        if(req?.role !== "owner"){
            throw new ApiError(401, "Unauthorized Request");
        }
        await Owner.findByIdAndUpdate(
            req.owner._id,
            {
                $unset : {
                    refreshToken : 1
                },
            },
            {
                new : true //this will make sure that it returns updated value
            }
        );
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        try {
            addLog({
                userType,
                userId : req.owner._id,
                action : "Owner Logged Out",
                ipAddress : req.ip
            });
        } catch (error) {
            console.log("Error while adding log entry for owner logout : ", error);
        }
    
        return res.
        status(200).
        clearCookie("accessToken", options).
        clearCookie("refreshToken", options).
        json(
            new ApiResponse(200, {}, "Owner Logged Out successfully")
        )
    } catch (error) {
        return res.status(error?.statusCode || 500).json(
            new ApiResponse(error?.statusCode || 500, {}, error?.message || "Something went wrong while logging out the owner")
        )
        
    }
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        if(req?.role !== "owner"){
            throw new ApiError(401, "Unauthorized Request");
        }

        const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    
        if(!incomingRefreshToken){
            throw new ApiError(401, "Unauthorized Request");
        }
    
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
        const owner = await Owner.findById(decodedToken?._id);
    
        if(!owner){
            throw new ApiError(401, "Invalid refresh Token");
        }
    
        if(incomingRefreshToken !== owner?.refreshToken){
            throw new ApiError(401, "Refresh Token is Expired");
        }
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(owner._id)
    
        try {
            addLog({
                userType,
                userId : owner._id,
                action : "Access Token Refreshed",
                ipAddress : req.ip
            });
        }
        catch (error) {
            console.log("Error while adding log entry for access token refresh : ", error);
        }

        return res.
        status(200).
        cookie("accessToken", accessToken, options).
        cookie("refreshToken", newRefreshToken, options).
        json(
            new ApiResponse(
                200,
                {
                    accessToken, refreshToken : newRefreshToken
                },
                "Access Token refreshed successfully"
            )
        )
    } catch (error) {
        return res.status(error?.statusCode || 500).json(
            new ApiResponse(error?.statusCode || 500, {}, error?.message || "Something went wrong while refreshing the access token")
        )
    }
})

const changeCurrentOwnerPassword = asyncHandler(async (req, res) => {

    try {
        if(req?.role !== "owner"){
            throw new ApiError(401, "Unauthorized Request");
        }
    
        const { oldPassword, newPassword } = req.body;
    
        const owner = await Owner.findById(req.owner?._id);
    
        const isPasswordCorrect = owner.isPasswordCorrect(oldPassword);
    
        if(!isPasswordCorrect){
            throw new ApiError(401, "Invalid Old Password");
        }
    
        owner.password = newPassword;
    
        await owner.save({validateBeforeSave : false});
    
        try {
            addLog({
                userType,
                userId : owner._id,
                action : "Password Changed",
                ipAddress : req.ip
            });
        }
        catch (error) {
            console.log("Error while adding log entry for password change : ", error);
        }
    
        return res.
        status(200).
        json(
            new ApiResponse(200, {}, "Password Changed Successfully")
        )
    } catch (error) {
        return res.status(error?.statusCode || 500).json(
            new ApiResponse(error?.statusCode || 500, {}, error?.message || "Something went wrong while changing the password")
        )
        
    }
})

const getCurrentOwner = asyncHandler(async (req, res) => {

    try {
        if(req?.role !== "owner"){
            throw new ApiError(401, "Unauthorized Request");
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(200, req.owner , "Current Owner Fetched successfully")
        );
    } catch (error) {
        return res.status(error?.statusCode || 500).json(
            new ApiResponse(error?.statusCode || 500, {}, error?.message || "Something went wrong while fetching the current owner")
        )
        
    }
})

const updateAccountDetails = asyncHandler(async (req, res) => {

    try {
        if(req?.role !== "owner"){
            throw new ApiError(401, "Unauthorized Request");
        }
    
        const {name, phoneNumber} = req.body;
    
        if(!name && !phoneNumber){
            throw new ApiError(400, "All fields are required");
        }
    
        const owner = await Owner.findByIdAndUpdate(
            req.owner?._id,
            {
                $set : {
                    name : name?.trim() || req.owner.name,
                    phoneNumber : phoneNumber?.trim() || req.owner.phoneNumber,
                }
            },
            {
                new : true
            }
        ).select("-password -refreshToken");
    
        try {
            addLog({
                userType,
                userId : owner._id,
                action : "Account Details Updated",
                details : {
                    owner
                },
                ipAddress : req.ip
            });
        }
        catch (error) {
            console.log("Error while adding log entry for account details update : ", error);
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(200, owner, "Name and Phone Number updated successfully")
        )
    } catch (error) {
        return res.status(error?.statusCode || 500).json(
            new ApiResponse(error?.statusCode || 500, {}, error?.message || "Something went wrong while updating the account details")
        )
    }
})

const getOwnerProfile = asyncHandler(async (req, res) => {

    try {
        if(req?.role !== "owner"){
            throw new ApiError(401, "Unauthorized Request");
        }
    
        const ownerId = req.owner._id;
        const owner = await Owner.findById(ownerId).select("-password -refreshToken");
    
        if(!owner){
            throw new ApiError(404, "Owner not found");
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(200, owner, "Owner Profile fetched successfully")
        )
    } catch (error) {
        return res.status(error?.statusCode || 500).json(
            new ApiResponse(error?.statusCode || 500, {}, error?.message || "Something went wrong while fetching the owner profile")
        )
        
    }
})

const deleteOwner = asyncHandler(async (req, res) => {

    try {
        if(req?.role !== "owner"){
            throw new ApiError(401, "Unauthorized Request");
        }
    
        const ownerId = req.owner._id;
    
        await deleteFromCloudinary(req.owner.avatar.public_id, req.owner.avatar.resource_type);
    
        await Owner.findByIdAndDelete(ownerId);
    
        try {
            addLog({
                userType,
                userId : ownerId,
                action : "Owner Deleted",
                ipAddress : req.ip
            });
        }
        catch (error) {
            console.log("Error while adding log entry for owner deletion : ", error);
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Owner deleted successfully")
        )
    } catch (error) {
        return res.status(error?.statusCode || 500).json(
            new ApiResponse(error?.statusCode || 500, {}, error?.message || "Something went wrong while deleting the owner")
        )
        
    }
});


export {
    registerOwner,
    loginOwner,
    logoutOwner,
    refreshAccessToken,
    changeCurrentOwnerPassword,
    getCurrentOwner,
    updateAccountDetails,
    getOwnerProfile,
    deleteOwner
};