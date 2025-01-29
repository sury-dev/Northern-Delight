import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "../UI";

function VendorSignupComponent() {
    const { register, handleSubmit, watch, control } = useForm();

    const selected = watch("login", "admin");
    const gender = watch("gender", "boy");
    const NameWatched = watch("name", "");

    const [name, setName] = useState("");
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [touchedFields, setTouchedFields] = useState({});

    const validateField = (name, value) => {
        let error = "";

        if (name === "name") {
            if (!value.trim()) error = "Name is required";
            else if (value.length < 3) error = "Must be at least 3 characters";
            else if (!/^[a-zA-Z\s]+$/.test(value)) error = "Only letters allowed";
        }

        if (name === "email") {
            if (!value.trim()) error = "Email is required";
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Invalid email format";
        }

        if (name === "phoneNumber") {
            if (!value.trim()) error = "Phone number is required";
            else if (!/^\d{10}$/.test(value)) error = "Must be 10 digits";
        }

        if (name === "username") {
            if (!value.trim()) error = "Username is required";
            else if (value.length < 3) error = "Must be at least 3 characters";
            else if (!/^[a-zA-Z0-9_]+$/.test(value)) error = "Only letters, numbers, and underscores allowed";
        }

        if (name === "password") {
            if (!value) error = "Password is required";
            else if (value.length < 8) error = "Must be at least 8 characters";
            else if (!/[A-Z]/.test(value)) error = "Must have an uppercase letter";
            else if (!/[a-z]/.test(value)) error = "Must have a lowercase letter";
            else if (!/[0-9]/.test(value)) error = "Must have a number";
            else if (!/[!@#$%^&*]/.test(value)) error = "Must have a special character";
        }

        if (name === "confirmPassword") {
            if (!value) error = "Confirm Password is required";
            else if (value !== watch("password")) error = "Passwords do not match";
        }

        if (name === "key" && selected === "admin" && !value.trim()) {
            error = "Admin Key is required";
        }

        if (name === "vid" && selected === "employee" && !value.trim()) {
            error = "VID is required";
        }

        setErrors((prev) => ({ ...prev, [name]: error }));
    };

    const handleBlur = (field) => {
        setTouchedFields((prev) => ({ ...prev, [field]: true }));
        validateField(field, watch(field));
    };

    useEffect(() => {
        setName(NameWatched);
    }, [NameWatched]);

    const handleFileChange = (file) => {
        if (file) {
            if (file.size > 2 ) {
                setErrors((prev) => ({ ...prev, avatar: "File size must be under 2MB" }));
            }
            const reader = new FileReader();
            reader.onload = () => setAvatarPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const removeAvatar = () => {
        setAvatarPreview(null);
        document.getElementById("avatarInput").value = "";
        errors.avatar && setErrors((prev) => ({ ...prev, avatar: "" }));
    };

    const onSubmit = (data) => {
        Object.keys(data).forEach((field) => validateField(field, data[field]));
        if (Object.values(errors).some((err) => err !== "")) return;
        console.log("Form submitted with:", data);
    };

    return (
        <form className="switcher-container" onSubmit={handleSubmit(onSubmit)}>
            {/* Role Selection */}
            <div className="labels-container">
                <div className={`slider ${selected === "admin" ? "admin-selected" : "employee-selected"}`}></div>

                <label className={`label ${selected === "admin" ? "text-white" : "text-gray-600"}`}>
                    <input type="radio" value="admin" defaultChecked {...register("login")} className="sr-only" />
                    Admin Signup
                </label>

                <label className={`label ${selected === "employee" ? "text-white" : "text-gray-600"}`}>
                    <input type="radio" value="employee" {...register("login")} className="sr-only" />
                    Employee Signup
                </label>
            </div>

            {/* Inputs */}
            <div className="inputs w-full flex flex-col items-center gap-4 mt-10 mb-10">
                {/* Avatar Upload */}
                <div className="avatar-container">
                    <input type="radio" id="male" value="boy" name="gender" className="gender-radio" defaultChecked {...register("gender")} />
                    <label htmlFor="male" className="male-selector">MALE</label>

                    <input type="radio" id="female" value="girl" name="gender" className="gender-radio" {...register("gender")} />
                    <label htmlFor="female" className="female-selector">FEMALE</label>

                    <div className="avatar-box">
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="User Avatar" className="avatar-image" />
                        ) : (
                            <img src={`https://avatar.iran.liara.run/public/${gender}?username=${name}`} alt="User Avatar" className="avatar-image" />
                        )}
                        <Controller
                            name="avatar"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <input id="avatarInput" type="file" accept="image/*" className="hidden-input"
                                    onChange={(e) => { field.onChange(e.target.files[0]); handleFileChange(e.target.files[0]); }}
                                />
                            )}
                        />
                        {!avatarPreview ? (
                            <label htmlFor="avatarInput" className="edit-button">EDIT</label>
                        ) : (
                            <button className="edit-button" onClick={removeAvatar}>CANCEL</button>
                        )}
                    </div>
                </div>
                        {errors.avatar && <p className="error">{errors.avatar}</p>}

                {/* Input Fields */}
                {["name", "email", "phoneNumber", "username", "password", "confirmPassword"].map((field) => (
                    <div key={field} className="w-full">
                        <Input
                            type={field.includes("password") ? "password" : "text"}
                            placeholder={field.replace(/([A-Z])/g, " $1")}
                            className="vendor-input-box"
                            {...register(field, {
                                onBlur: () => handleBlur(field),
                            })}
                        />
                        {touchedFields[field] && errors[field] && <p className="error">{errors[field]}</p>}
                    </div>
                ))}

                {selected === "admin" && (
                    <div className="w-full">
                        <Input
                            type="text"
                            placeholder="Enter your Key"
                            className="vendor-input-box"
                            {...register("key", {
                                onBlur: () => handleBlur("key"),
                            })}
                        />
                        {touchedFields.key && errors.key && <p className="error">{errors.key}</p>}
                    </div>
                )}

                {selected === "employee" && (
                    <div className="w-full">
                        <Input
                            type="text"
                            placeholder="Your VID"
                            className="vendor-input-box"
                            {...register("vid", {
                                onBlur: () => handleBlur("vid"),
                            })}
                        />
                        {touchedFields.vid && errors.vid && <p className="error">{errors.vid}</p>}
                    </div>
                )}
            </div>

            <button className="sbmtbtn" type="submit">Login</button>
        </form>
    );
}

export default VendorSignupComponent;
