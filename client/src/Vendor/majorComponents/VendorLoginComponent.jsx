import React, { useState } from "react";
import { useForm } from "react-hook-form";
import vendorService from "../../server/vendorService.js";
import { login as authLogin } from "../../app/slices/authSlice.js";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Input } from '../UI'
import './VendorLoginComponent.css'

function VendorLoginComponent() {
    const { register, handleSubmit, watch } = useForm();
    const selected = watch("login", "admin"); // Default value is 'admin'
    const [error, setError] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        console.log("Form submitted with:", data);
        if (!data.usernameOrEmail || !data.password) {
            setError("Both Fields are required");
            return;
        }
        setError("");
        const vendorData = await vendorService.loginVendor({ ...data });
        if (vendorData && vendorData.status == 200) {
            if (data.login === "admin") {
                console.log(vendorData.data.data.owner);
                dispatch(authLogin({ userData: vendorData.data.data.owner, role: "admin" }));
                navigate("/vendor/dashboard");
            } else {
                console.log(vendorData.data.data.employee);
                dispatch(authLogin({ userData: vendorData.data.data.employee, role: "employee" }));
                navigate("/vendor/dashboard");
            }
        }
        else {
            const regex = /Error:\s*(.*?)(<br>|<\/pre>)/;
            const match = vendorData.data.match(regex);
            setError(match[1]);
        }
    };

    return (
        <form className="switcher-container" onSubmit={handleSubmit(onSubmit)}>

            {/* Labels and inputs */}
            <div className="labels-container">
                {/* Background div */}
                <div
                    className={`slider ${selected === "admin" ? "admin-selected" : "employee-selected"}`}
                ></div>

                <label
                    className={`label ${selected === "admin" ? "text-white" : "text-gray-600"}`}
                >
                    <input
                        type="radio"
                        value="admin"
                        defaultChecked
                        {...register("login", { required: true })}
                        className="sr-only"
                    />
                    Admin Login
                </label>

                <label
                    className={`label ${selected === "employee" ? "text-white" : "text-gray-600"}`}
                >
                    <input
                        type="radio"
                        value="employee"
                        {...register("login", { required: true })}
                        className="sr-only"
                    />
                    Employee Login
                </label>
            </div>

            {/* Inputs */}

            <div className="inputs w-full flex flex-col items-center gap-4">
                <Input
                    type="text"
                    placeholder="Enter Username or Email"
                    className="vendor-input-box"
                    {...register("usernameOrEmail", { required: true })}
                />
                <Input
                    type="password"
                    placeholder="Enter your password"
                    className="vendor-input-box"
                    {...register("password", { required: true })}
                />
                {error && <p className="text-red-500">{error}</p>}
            </div>
            <div className="last-box">
                <p>Don't have an account yet? <a href="/vendor/auth/register" className="link">Signup Here</a></p>
                <button className="sbmtbtn" type="submit">Login</button>
            </div>
        </form>
    );
}

export default VendorLoginComponent