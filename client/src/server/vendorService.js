import axios from "axios";
import { useNavigate } from "react-router-dom";

export class VendorService {
    async createVendor({ avatar, login, name, username, email, password, confirmPassword, phoneNumber, key = "", gender, vid = "" }) {
        try {
            const formData = new FormData();
            const fields = { name, username, email, password, phoneNumber, key, gender, vid, confirmPassword };
            Object.entries(fields).forEach(([key, value]) => formData.append(key, value));

            formData.append("avatar", avatar);

            let userData;

            if (login === "admin") {
                userData = await axios.post("/api/owner/register", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                });
            }
            else {
                userData = await axios.post("/api/employee/register", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                });
            }

            return userData;
        }
        catch (error) {
            console.log("Server :: VendorService :: createVendor :: error :: ", error);
            return error.response;
        }
    }

    async loginVendor({ login, usernameOrEmail, password }) {
        try {
            let userData;

            if (login === "admin") {
                userData = await axios.post("/api/owner/login", { usernameOrEmail, password });
            }
            else {
                userData = await axios.post("/api/employee/login", { usernameOrEmail, password });
            }

            return userData;
        }
        catch (error) {
            console.log("Server :: VendorService :: loginVendor :: error :: ", error);
            return error.response;
        }
    }

    async logoutVendor(role) {
        try {
            let response;
            if(role === "admin") {
                const response = await axios.post("/api/owner/logout");
                return response;
            }
            else {
                const response = await axios.post("/api/employee/logout");
                return response;
            }
        }
        catch (error) {
            console.log("Server :: VendorService :: logoutVendor :: error :: ", error);
            return error.response;
        }
    }
    async getCurrentOwner(called = false) {
        try {
            const owner = await axios.get("/api/owner/current-owner");
            return owner;
        }
        catch (error) {
            if (!called) {
                console.log("Server :: VendorService :: getCurrentOwner :: error :: ", error);
            }
            return error.response;
        }
    }
    async getCurrentEmployee(called = false) {
        try {
            const employee = await axios.get("/api/employee/current-employee");
            return employee;
        }
        catch (error) {
            if (!called) {
                console.log("Server :: VendorService :: getCurrentEmployee :: error :: ", error);
            }
            return error.response;
        }
    }
    async getCurrentVendor() {
        try {
            let response;
            const owner = await this.getCurrentOwner(true);
            if (owner.status === 200) {
                response = owner;
                response.role = "admin";
                return response;
            }
            const employee = await this.getCurrentEmployee(true);
            if (employee.status === 200) {
                response = employee;
                response.role = "employee";
                return response;
            }
            return response;
        }
        catch (error) {
            console.log("Server :: VendorService :: getCurrentVendor :: error :: ", error);
            return error.response;
        }
    }
    async getAllEmployees({ search = "" }) {
        try {
            const employees = await axios.get(`/api/owner-dashboard/get-all-employees?search=${search}`);
            return employees;
        }
        catch (error) {
            console.log("Server :: VendorService :: getAllEmployees :: error :: ", error);
            return error.response;
        }
    }
    async toggleEmployeeActivation(employeeId) {
        try {
            const response = await axios.patch(`/api/owner-dashboard/toggle-employee-activation/${employeeId}`);
            return response;
        }
        catch (error) {
            console.log("Server :: VendorService :: toggleEmployeeActivation :: error :: ", error);
            return error.response;
        }
    }
    async deleteEmployee(employeeId) {
        try {
            const response = await axios.delete(`/api/owner-dashboard/delete-employee/${employeeId}`);
            return response;
        }
        catch (error) {
            console.log("Server :: VendorService :: deleteEmployee :: error :: ", error);
            return error.response;
        }
    }
}

const vendorService = new VendorService();
export default vendorService;