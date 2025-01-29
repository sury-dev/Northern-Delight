import { ActivityLog } from "../models/activityLog.model.js";

class ActivityLogger {
    /**
     * Adds a log entry to the database.
     * @param {String} userType - The type of the user ('owner', 'employee', 'customer').
     * @param {String} userId - The ID of the user performing the action.
     * @param {String} action - A description of the action performed.
     * @param {Object} [details={}] - Additional metadata about the action.
     * @param {String} [ipAddress=null] - The IP address of the user.
     */
    static async addLog({ userType, userId, action, details = {}, ipAddress = null }) {
        try {
            if (!userType || !userId || !action) {
                throw new Error('userType, userId, and action are required to log activity.');
            }

            const logEntry = new ActivityLog({
                userType,
                userId,
                action,
                details,
                ipAddress,
            });

            await logEntry.save();
            console.log(`[ActivityLogger] Log added: ${action}`);
        } catch (error) {
            console.error(`[ActivityLogger] Error logging activity: ${error.message}`);
        }
    }
}

// Export the class and the static method
export default ActivityLogger;

// Optional: Export the addLog method directly for easier access
export const addLog = ActivityLogger.addLog;
