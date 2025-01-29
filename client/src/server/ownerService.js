import axios from "axios";
import { useNavigate } from "react-router-dom";

export class OwnerService {
    async createOwner({ avatar, login, name, username, email, password, confirmPassword, phoneNumber, key = "", gender, vid = "" }) {
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
            else{
                userData = await axios.post("/api/employee/register", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                });
            }

            return userData;
        }
        catch (error) {
            console.log("Server :: OwnerService :: createOwner :: error :: ", error);
            return error.response;
        }
    }
}

const ownerService = new OwnerService();
export default ownerService;