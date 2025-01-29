import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';
import { Owner } from "../models/owner.model.js";
import { Employee } from "../models/employee.model.js";


export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","") // for android development
    
        if(!token){
            throw new ApiError(401, "Unauthorized access !! (trying in verifyJWT)");
        }
    
        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        switch(decodedToken?.role){
            case "owner":
                const owner = await Owner.findById(decodedToken?._id).select("-password -refreshToken");
                
                if(!owner){
                    throw new ApiError(401, "Invalid Access Token"); //TODO: - discuss about frontend
                }
                
                req.owner = owner;
                req.role = "owner";

                break;
            case "employee":
                console.log("Employee");
                const employee = await Employee.findById(decodedToken?._id).select("-password -refreshToken");

                if(!employee){
                    throw new ApiError(401, "Invalid Access Token"); //TODO: - discuss about frontend
                }

                if(!employee.active){
                    throw new ApiError(401, "Inactive Employee Account");
                }

                req.employee = employee;
                req.role = "employee";

                break;
            default:
                throw new ApiError(401, "Unauthorized access !! (trying in verifyJWT)");
        }
    
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token (catch block of verifyJWT)");
    }
})