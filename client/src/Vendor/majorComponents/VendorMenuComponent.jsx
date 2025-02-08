import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import './VendorMenuComponent.css';

function VendorMenuComponent() {
    const [searchTerm, setSearchTerm] = useState("");
    const vendorRole = useSelector(state => state.auth.role);
    const navigate = useNavigate();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isComboModalOpen, setIsComboModalOpen] = useState(false);
    const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const { register, handleSubmit, reset } = useForm();

    const handleSearch = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    useEffect(() => {
        if (vendorRole !== "admin") {
            navigate('/vendor/Orders');
        } else {
            setIsAuthorized(true);
        }
    }, [vendorRole, navigate]);

    const openComboModal = () => setIsComboModalOpen(true);
    const closeComboModal = () => {
        setIsComboModalOpen(false);
        reset();
    };

    const openFoodModal = () => setIsFoodModalOpen(true);
    const closeFoodModal = () => {
        setIsFoodModalOpen(false);
        reset();
    };

    const openCategoryModal = () => setIsCategoryModalOpen(true);
    const closeCategoryModal = () => {
        setIsCategoryModalOpen(false);
        reset();
    };

    const onSubmitCombo = (data) => {
        console.log("New Combo:", data);
        closeComboModal();
    };

    const onSubmitFood = (data) => {
        console.log("New Food Item:", data);
        closeFoodModal();
    };

    if (!isAuthorized) {
        return null;
    }

    return (
        <div className="vendorMenuComponent w-full h-full relative">
            <div className="header">
                <div className="header-left">
                    <h3>
                        Total Categories: <span className="totalEmployees">2</span>
                    </h3>
                    <h3>
                        Food Items: <span className="activeEmployees">5</span>
                    </h3>
                    <h3>
                        Combos: <span className="inactiveEmployees">7</span>
                    </h3>
                </div>
                <div className="header-right">
                    <input
                        type="text"
                        placeholder="Search Food Items"
                        id="searchBox"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    <button id="addFoodItemBtn" onClick={openFoodModal}>Add a Food Item</button>
                    <button id="addComboBtn" onClick={openComboModal}>Add a Combo</button>
                    <button id="addCategoryBtn" onClick={openCategoryModal}>Add a Category</button>
                </div>
            </div>

            {isComboModalOpen && (
                <div className="modal-overlay" onClick={closeComboModal}>
                    <div className="add-menu-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Add a Combo</h2>
                        <form onSubmit={handleSubmit(onSubmitCombo)}>
                            <input type="text" placeholder="Combo Name" {...register("comboName")} required />
                            <textarea placeholder="Combo Description" {...register("comboDescription")} required />
                            <div className="modal-buttons">
                                <button type="submit">Create Combo</button>
                                <button type="button" onClick={closeComboModal}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isFoodModalOpen && (
                <div className="modal-overlay" onClick={closeFoodModal}>
                    <div className="add-menu-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Add a Food Item</h2>
                        <form onSubmit={handleSubmit(onSubmitFood)}>
                            <input type="text" placeholder="Food Item Name" {...register("foodName")} required />
                            <textarea placeholder="Food Description" {...register("foodDescription")} required />
                            <div className="modal-buttons">
                                <button type="submit">Create Food Item</button>
                                <button type="button" onClick={closeFoodModal}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isCategoryModalOpen && (
                <div className="modal-overlay" onClick={closeCategoryModal}>
                    <div className="add-menu-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Add a Category</h2>
                        <form>
                            <input type="text" placeholder="Category Name" required />
                            <textarea placeholder="Category Description" required />
                            <div className="modal-buttons">
                                <button type="submit">Create Category</button>
                                <button type="button" onClick={closeCategoryModal}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VendorMenuComponent;
