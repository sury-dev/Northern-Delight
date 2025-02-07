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

    try {
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
        const updatedEmployeeStatus = employee.active ? "Activated" : "Deactivated";
        await employee.save();
    
        try {
            addLog({
                userType,
                userId : req.owner._id,
                details : {
                    employeeId : employee._id,
                    employeeName : employee.name
                },
                action : `Employee ${updatedEmployeeStatus}`,
                ipAddress : req.ip
            });
        } catch (error) {
            console.log("Error while adding log entry for employee activation toggle : ", error);
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
    } catch (error) {
        return res.status(error?.statusCode || 500).json(
            new ApiResponse(error?.statusCode || 500, {}, error?.message || "Something went wrong while toggling employee activation status")
        )
    }
});

export const fetchAllEmployees = asyncHandler(async (req, res) => {
    try {

        //get search option from query
        let search = req.query.search;
        if(!search) {
            search = "";
        }

        if(req.role !== userType) {
            throw new ApiError(403, "Unauthorized access");
        }
        const employees = await Employee.find({
            $or : [
                { name : { $regex : search, $options : "i" } },
                { username : { $regex : search, $options : "i" } },
                { email : { $regex : search, $options : "i" } },
                { phoneNumber : { $regex : search, $options : "i" } },
                { vid : { $regex : search, $options : "i" } },
                {jobTitle : { $regex : search, $options : "i" } }
            ]
        })
        .sort({ createdAt : -1 });

        if(!employees) {
            throw new ApiError(404, "No employees found");
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, employees, "Employees fetched successfully")
        );

    } catch (error) {
        return res.status(error?.statusCode || 500).json(
            new ApiResponse(error?.statusCode || 500, {}, error?.message || "Something went wrong while fetching employees")
        )
    }
})

export const deleteEmployee = asyncHandler(async (req, res) => {
    try {
        if(req.role !== userType) {
            throw new ApiError(403, "Unauthorized access");
        }
    
        const { id } = req.params;
    
        if(!id || !mongoose.isValidObjectId(id)) {
            throw new ApiError(400, "Invalid employee id");
        }

        
        const employee = await Employee.findByIdAndDelete(id);
        
        //delete employee avatar from cloudinary

        try {
            await deleteFromCloudinary(employee.avatar.public_id, employee.avatar.resource_type);
        } catch (error) {
            console.log("Error while deleting employee avatar from cloudinary : ", error);
        }

        if(!employee) {
            throw new ApiError(404, "Employee not found");
        }


        try {
            addLog({
                userType,
                userId : req.owner._id,
                details : {
                    employeeName : employee.name,
                    vid : employee.vid
                },
                action : "Employee Deleted",
                ipAddress : req.ip
            });
        } catch (error) {
            console.log("Error while adding log entry for employee deletion : ", error);
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, {
                employeeId : employee._id,
                employeeName : employee.name
            }, "Employee deleted successfully")
        );
    } catch (error) {
        return res.status(error?.statusCode || 500).json(
            new ApiResponse(error?.statusCode || 500, {}, error?.message || "Something went wrong while deleting employee")
        )
    }
});