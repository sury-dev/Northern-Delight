// models/activityLog.js
import mongoose, {Schema} from "mongoose";

const activityLogSchema = new mongoose.Schema(
    {
        userType: {
            type: String,
            enum: ['owner', 'employee', 'customer'],
            required: true,
            index: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'userType', // Dynamically reference 'owner', 'employee', or 'customer'
            required: true
        },
        action: {
            type: String,
            required: true,
            index: true
        },
        details: {
            type: Object, // Flexible to store structured metadata about the action
            required: false
        },
        ipAddress: {
            type: String // Optional field to track the user's IP
        },
    },
    { timestamps: true }
);

activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 });

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
