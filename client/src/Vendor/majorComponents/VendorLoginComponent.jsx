import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from '../UI'
import './VendorLoginComponent.css'

function VendorLoginComponent() {
    const { register, handleSubmit, watch } = useForm();
    const selected = watch("login", "admin"); // Default value is 'admin'
    const [error, setError] = useState(false);

    const onSubmit = (data) => {
        console.log("Form submitted with:", data);
        if (!data.usernameOrEmail || !data.password) {
            setError(true);
            return;
        }
        setError(false);
        // Handle the form submission here (e.g., API call)
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
                    placeholder="usernameOrEmail"
                    className="vendor-input-box"
                    {...register("usernameOrEmail", { required: true })}
                />
                <Input
                    type="password"
                    placeholder="Password"
                    className="vendor-input-box"
                    {...register("password", { required: true })}
                />
                {error && <p className="text-red-500">Both Fields are required</p>}
            </div>
            <button className="sbmtbtn" type="submit">Login</button>
        </form>
    );
}

export default VendorLoginComponent