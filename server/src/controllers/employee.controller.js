import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Employee } from "../models/employee.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs";
import jwt from "jsonwebtoken";
import ActivityLogger, { addLog } from "../utils/activityLogger.js";
import { count } from "console";

const userType = "employee";

const generateAccessAndRefreshToken = async (employeeId) => {
    try {

        const employee = await Employee.findById(employeeId);
        const accessToken = await employee.generateAccessToken();
        const refreshToken = await employee.generateRefreshToken();

        employee.refreshToken = refreshToken;
        await employee.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token : ", error);
    }
}

const registerEmployee = asyncHandler(async (req, res) => {

    let avatarLocalPath;
    try {
        const { name, username, email, password, confirmPassword, phoneNumber, vid, jobTitle, gender } = req.body;
        console.log("req.body : ", req.body);
        console.log("req.file : ", req.file);
        if (
            [name, username, email, password, phoneNumber, jobTitle, gender].some(
                (field) => field?.trim() === ""
            )
        ) {
            throw new ApiError(400, "All fields except VID are required.");
        }

        const existingEmployee = await Employee.findOne({
            $or: [{ username }, { email: email.toLowerCase() }]
        });

        if (existingEmployee) {
            if (existingEmployee.username === username) throw new ApiError(409, "Username already exists");
            if (existingEmployee.email === email.toLowerCase()) throw new ApiError(409, "Email already exists");
        }

        if (password !== confirmPassword) {
            throw new ApiError(400, "Passwords do not match");
        }

        let avatar;
        let avatarObj;
        if (req.file?.path) {
            avatarLocalPath = req.file.path;
            avatarObj = await uploadOnCloudinary(avatarLocalPath, "employee"); // Upload to Cloudinary if a file exists
            avatar = avatarObj.url;
        } else {
            avatar = `https://avatar.iran.liara.run/public/${gender}?username=${username}`; // Default avatar URL
        }

        const employee = await Employee.create({
            name,
            email: email.toLowerCase(),
            username: username.trim(),
            password,
            phoneNumber: phoneNumber.trim(),
            avatar : {
                url : avatar,
                public_id : avatarObj?.public_id || null,
                resource_type : avatarObj?.resource_type || "image"
            },
            vid: vid?.trim() || "",
            jobTitle: jobTitle?.trim() || ""
        });

        const createdEmployee = await Employee.findById(employee._id).select(
            "-password -refreshToken"
        );

        if (!createdEmployee) {
            throw new ApiError(500, "Something went wrong while registering the employee");
        }

        try {
            addLog({
                userType,
                userId : createdEmployee._id,
                action : "Employee Registered",
                details : {
                    owner : createdEmployee
                },
                ipAddress : req.ip
            });
        } catch (error) {
            console.log("Error while adding log entry for the new employee : ", error);
        }

        return res.status(201).json(
            new ApiResponse(201, createdEmployee, "Employee registered successfully")
        );
    } catch (error) {
        if(avatarLocalPath){
            fs.unlinkSync(avatarLocalPath); // Delete the file from the server if an error occurs
        }
        res.status(error?.statusCode || 500).json(
            new ApiResponse(error?.statusCode || 500, {}, error?.message || "Something went wrong while registering the employee")
        );
    }

})

const loginEmployee = asyncHandler(async (req, res) => {

    try {
        const { usernameOrEmail, password } = req.body;
    
        if (!usernameOrEmail || !password) {
            throw new ApiError(400, "Username Or Email along with corresponding password is required");
        }
    
        const employee = await Employee.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail.toLowerCase() }] });
    
        if (!employee) {
            throw new ApiError(404, "Employee does not exist");
        }
    
        if (!employee.active) {
            throw new ApiError(401, "Employee is not activated yet");
        }
    
        const isPasswordValid = await employee.isPasswordCorrect(password);
    
        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid Employee Credentials");
        }
    
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(employee._id);
    
        const loggedInEmployee = await Employee.findById(employee._id).select("-password -refreshToken");
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        try {
            addLog({
                userType,
                userId : loggedInEmployee._id,
                action : "Employee Logged In",
                ipAddress : req.ip
            });
        } catch (error) {
            console.log("Error while adding log entry for employee login : ", error);
        }
    
        return res.
            status(200).
            cookie("accessToken", accessToken, options).
            cookie("refreshToken", refreshToken, options).
            json(
                new ApiResponse(
                    200,
                    {
                        employee: loggedInEmployee, accessToken, refreshToken
                    },
                    "Employee Logged in successfully"
                )
            )
    } catch (error) {
        res.status(error?.statusCode || 500).json(
            new ApiResponse(error?.statusCode || 500, {}, error?.message || "Something went wrong while logging in the employee")
        );
    }
})

const logoutEmployee = asyncHandler(async (req, res) => {

    try {
        if (req?.role !== "employee") {
            throw new ApiError(401, "Unauthorized Request");
        }
    
        await Employee.findByIdAndUpdate(
            req.employee._id,
            {
                $unset: {
                    refreshToken: 1
                },
            },
            {
                new: true //this will make sure that it returns updated value
            }
        );
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        try {
            addLog({
                userType,
                userId : req.employee._id,
                action : "Employee Logged Out",
                ipAddress : req.ip
            });
        } catch (error) {
            console.log("Error while adding log entry for employee logout : ", error);
        }
    
        return res.
            status(200).
            clearCookie("accessToken", options).
            clearCookie("refreshToken", options).
            json(
                new ApiResponse(200, {}, "Employee Logged Out successfully")
            )
    } catch (error) {
        return res.status(error?.statusCode || 500).json(
            new ApiResponse(error?.statusCode || 500, {}, error?.message || "Something went wrong while logging out the employee")
        )
    }
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    try {

        if (req?.role !== "employee") {
            throw new ApiError(401, "Unauthorized Request");
        }

        const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized Request");
        }

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const employee = await Employee.findById(decodedToken?._id);

        if (!employee) {
            throw new ApiError(401, "Invalid refresh Token");
        }

        if (incomingRefreshToken !== employee?.refreshToken) {
            throw new ApiError(401, "Refresh Token is Expired");
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(employee._id);

        try {
            addLog({
                userType,
                userId : employee._id,
                action : "Employee Token Refreshed",
                ipAddress : req.ip
            });
        } catch (error) {
            console.log("Error while adding log entry for employee token refresh : ", error);
        }

        return res.
            status(200).
            cookie("accessToken", accessToken, options).
            cookie("refreshToken", newRefreshToken, options).
            json(
                new ApiResponse(
                    200,
                    {
                        accessToken, refreshToken: newRefreshToken
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

const changeCurrentEmployeePassword = asyncHandler(async (req, res) => {

    try {
        if (req?.role !== "employee") {
            throw new ApiError(401, "Unauthorized Request");
        }
    
        const { oldPassword, newPassword } = req.body;
    
        const employee = await Employee.findById(req.employee?._id);
    
        const isPasswordCorrect = employee.isPasswordCorrect(oldPassword);
    
        if (!isPasswordCorrect) {
            throw new ApiError(401, "Invalid Old Password");
        }
    
        employee.password = newPassword;
    
        await employee.save({ validateBeforeSave: false });
    
        try {
            addLog({
                userType,
                userId : employee._id,
                action : "Employee Password Changed",
                ipAddress : req.ip
            });
        }
        catch (error) {
            console.log("Error while adding log entry for employee password change : ", error);
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

const getCurrentEmployee = asyncHandler(async (req, res) => {

    try {
        if (req?.role !== "employee") {
            throw new ApiError(401, "Unauthorized Request");
        }
    
        return res
            .status(200)
            .json(
                new ApiResponse(200, req.employee, "Current Employee Fetched successfully")
            );
    } catch (error) {
        return res.status(error?.statusCode || 500).json(
            new ApiResponse(error?.statusCode || 500, {}, error?.message || "Something went wrong while fetching the current employee")
        )
    }
})

const updateAccountDetails = asyncHandler(async (req, res) => {

    try {
        if (req?.role !== "employee") {
            throw new ApiError(401, "Unauthorized Request");
        }
    
        const { name, phoneNumber } = req.body;
    
        if (!name && !phoneNumber) {
            throw new ApiError(400, "All fields are required");
        }
    
        const employee = await Employee.findByIdAndUpdate(
            req.employee?._id,
            {
                $set: {
                    name: name?.trim() || req.employee.name,
                    phoneNumber: phoneNumber?.trim() || req.employee.phoneNumber,
                }
            },
            {
                new: true
            }
        ).select("-password -refreshToken");
    
        try {
            addLog({
                userType,
                userId : employee._id,
                action : "Employee Account Details Updated",
                details : {
                    updatedFields : {
                        name : employee.name,
                        phoneNumber : employee.phoneNumber
                    }
                },
                ipAddress : req.ip
            });
        } catch (error) {
            console.log("Error while adding log entry for employee account details update : ", error);
        }
    
        return res
            .status(200)
            .json(
                new ApiResponse(200, employee, "Name and Phone Number updated successfully")
            )
    } catch (error) {
        return res.status(error?.statusCode || 500).json(
            new ApiResponse(error?.statusCode || 500, {}, error?.message || "Something went wrong while updating the account details")
        )
    }
})

const getEmployeeProfile = asyncHandler(async (req, res) => {

    try {
        if (req?.role !== "employee") {
            throw new ApiError(401, "Unauthorized Request");
        }
    
        const employeeId = req.employee._id;
        const employee = await Employee.findById(employeeId).select("-password -refreshToken");
    
        if (!employee) {
            throw new ApiError(404, "Employee not found");
        }
    
        return res
            .status(200)
            .json(
                new ApiResponse(200, employee, "Employee Profile fetched successfully")
            )
    } catch (error) {
        return res.status(error?.statusCode || 500).json(
            new ApiResponse(error?.statusCode || 500, {}, error?.message || "Something went wrong while fetching the employee profile")
        )
        
    }
})

const deleteEmployee = asyncHandler(async (req, res) => {

    try {
        if (req?.role !== "employee") {
            throw new ApiError(401, "Unauthorized Request");
        }
    
        const employeeId = req.employee._id;
    
        await deleteFromCloudinary(req.employee.avatar.public_id, req.employee.avatar.resource_type);
    
        await Employee.findByIdAndDelete(employeeId);
    
        try {
            addLog({
                userType,
                userId : employeeId,
                action : "Employee Deleted",
                ipAddress : req.ip
            });
        }
        catch (error) {
            console.log("Error while adding log entry for employee deletion : ", error);
        }
    
        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "Employee deleted successfully")
            )
    } catch (error) {
        return res.status(error?.statusCode || 500).json(
            new ApiResponse(error?.statusCode || 500, {}, error?.message || "Something went wrong while deleting the employee")
        )
        
    }
});

export {
    registerEmployee,
    loginEmployee,
    logoutEmployee,
    refreshAccessToken,
    changeCurrentEmployeePassword,
    getCurrentEmployee,
    updateAccountDetails,
    getEmployeeProfile,
    deleteEmployee
};