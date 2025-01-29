import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Employee } from "../models/employee.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs";
import jwt from "jsonwebtoken";
import ActivityLogger, { addLog } from "../utils/activityLogger.js";
import mongoose from "mongoose";

const userType = "owner";

export const toggleEmployeeActivation = asyncHandler(async (req, res) => {

    if(req.role !== userType) {
        throw new ApiError(403, "Unauthorized access");
    }

    const { id } = req.params;

    if(!id || !mongoose.isValidObjectId(id)) {
        throw new ApiError(400, "Invalid employee id");
    }

    const employee = await Employee.findById(id);

    if(!employee) {
        throw new ApiError(404, "Employee not found");
    }

    employee.active = !employee.active;
    await employee.save();

    try {
        addLog({
            userType,
            userId : owner._id,
            details : {
                employeeId : employee._id,
                employeeName : employee.name
            },
            action : "Activated employee",
            ipAddress : req.ip
        });
    } catch (error) {
        console.log("Error while adding log entry for owner login : ", error);
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {
            employeeId : employee._id,
            employeeName : employee.name,
            active : employee.active
        }, "Employee activation status updated successfully")
    );
});

