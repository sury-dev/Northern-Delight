import mongoose from 'mongoose';
import { ActivityLog } from "../models/activityLog.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getActivityLogs = asyncHandler(async (req, res) => {
    try {
        if (req?.role !== 'owner') {
            throw new ApiError(403, "You are not authorized to access this resource");
        }

        const { userType, userId, action, startDate, endDate, page = 1, limit = 10, search = "" } = req.query;

        // Build filters dynamically based on provided query params
        const filters = {};

        if (userType) filters.userType = userType;
        if (userId) {
            // Convert userId to ObjectId for proper matching
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new ApiError(400, "Invalid userId format");
            }
            filters.userId = new mongoose.Types.ObjectId(userId);
        }
        if (action) filters.action = action;
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }

        // Pagination parameters
        const skip = (page - 1) * limit;

        // Add search functionality (applied separately from filters)
        const searchFilters = search
            ? {
                  $or: [
                      { 'userDetails.username': { $regex: search, $options: "i" } },
                      { 'userDetails.name': { $regex: search, $options: "i" } },
                      { 'userDetails.email': { $regex: search, $options: "i" } },
                      { 'userDetails.vid': { $regex: search, $options: "i" } },
                  ],
              }
            : {};

        // Fetch activity logs from the database using aggregation pipelines
        const logs = await ActivityLog.aggregate([
            { $match: filters }, // Apply filters
            {
                $lookup: {
                    from: 'owners', // Collection for owners
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'ownerDetails',
                },
            },
            {
                $lookup: {
                    from: 'employees', // Collection for employees
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'employeeDetails',
                },
            },
            {
                $addFields: {
                    userDetails: {
                        $switch: {
                            branches: [
                                {
                                    case: { $eq: ['$userType', 'owner'] },
                                    then: { $arrayElemAt: ['$ownerDetails', 0] },
                                },
                                {
                                    case: { $eq: ['$userType', 'employee'] },
                                    then: { $arrayElemAt: ['$employeeDetails', 0] },
                                },
                            ],
                            default: null, // Fallback if userType is unknown
                        },
                    },
                },
            },
            { $match: searchFilters }, // Apply search filters after adding userDetails
            { $sort: { createdAt: -1 } }, // Sort by creation date (latest first)
            { $skip: skip }, // Skip for pagination
            { $limit: parseInt(limit) }, // Limit for pagination
            {
                $project: {
                    ownerDetails: 0, // Remove unneeded details
                    employeeDetails: 0, // Remove unneeded details
                },
            },
        ]);

        // Get the total count for pagination metadata
        const totalCount = await ActivityLog.countDocuments(filters);

        // Response with data and pagination info
        res.status(200).json({
            success: true,
            data: logs,
            meta: {
                totalCount,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit),
            },
        });
    } catch (error) {
        throw new ApiError(400, "Error in getting the activity Logs: " + error.message);
    }
});
