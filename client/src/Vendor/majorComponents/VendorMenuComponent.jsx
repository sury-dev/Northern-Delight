import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { set, useForm } from 'react-hook-form';
import './VendorMenuComponent.css';
import vendorService from '../../server/vendorService';

function VendorMenuComponent() {
    const vendorRole = useSelector(state => state.auth.role);
    const navigate = useNavigate();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isComboModalOpen, setIsComboModalOpen] = useState(false);
    const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [categoryBeingUpdated, setCategoryBeingUpdated] = useState(null);
    const { register, handleSubmit, reset } = useForm();
    const foodItems = [
        {
            _id: "1",
            foodName: "Chicken Biryani",
            foodDescription: "A delicious plate of chicken biryani",
            category: "Starter",
        },
        {
            _id: "2",
            foodName: "Paneer Butter Masala",
            foodDescription: "A delicious plate of paneer butter masala",
            category: "Starter",
        },
        {
            _id: "3",
            foodName: "Gulab Jamun",
            foodDescription: "A delicious plate of gulab jamun",
            category: "Starters",
        },
        {
            _id: "4",
            foodName: "Veg Manchurian",
            foodDescription: "A delicious plate of veg manchurian",
            category: "Starters",
        },
    ]


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

    const fetchFoodCategories = async () => {
        const fetchedCategories = await vendorService.fetchFoodCategories();
        if (fetchedCategories && fetchedCategories.status === 200) {
            setCategories(fetchedCategories.data.data);
        }
    }


    const handlecategoryUpdate = async (data) => {
        console.log("Updating Category:", data);
        // Update the categories using _id from categoryBeingUpdated
        const response = await vendorService.updateFoodCategory({categoryId : categoryBeingUpdated, ...data});
        if (response && response.status === 200) {
            console.log("Category updated successfully");
            const updatedCategories = categories.map((category) => {
                if (category._id === categoryBeingUpdated) {
                    return { ...category, ...data };
                }
                return category;
            });
            setCategories(updatedCategories);
        } else {
            console.error("Error updating category:", response);
        }
        setCategoryBeingUpdated(null);
    }

    useEffect(() => {
        // Fetch all categories
        fetchFoodCategories();
    }, []);

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

    const onSubmitCategory = async (data) => {
        console.log("New Category:", data);
        const response = await vendorService.createFoodCategory({...data});
        if (response && response.status === 201) {
            setCategories([...categories, response.data.data]);
        } else {
            console.error("Error creating category:", response);
        }
        closeCategoryModal();
    }

    const deleteCategory = async (categoryId) => {
        // Delete the category with categoryId
        const response = await vendorService.deleteFoodCategory(categoryId);
        if (response && response.status === 200) {
            const updatedCategories = categories.filter((category) => category._id !== categoryId);
            setCategories(updatedCategories);
            console.log("Category deleted successfully");
        } else {
            console.error("Error deleting category:", response);
        }
    }

    if (!isAuthorized) {
        return null;
    }


    return (
        <div className="vendorMenuComponent w-full h-full relative">
            <div className="header">
                <div className="header-left">
                    <h3>
                        Total Categories: <span className="totalEmployees">{categories.length}</span>
                    </h3>
                    <h3>
                        Food Items: <span className="activeEmployees">{foodItems.length}</span>
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
                    <button className='addItemBtn' style={{ '--themeColor': '#10B981' }} onClick={openFoodModal}>Add a Food Item</button>
                    <button className='addItemBtn' style={{ '--themeColor': '#2DD4BF' }} onClick={openComboModal}>Add a Combo</button>
                    <button className='addItemBtn' style={{ '--themeColor': '#D4AD2D' }} onClick={openCategoryModal}>Add a Category</button>
                </div>
            </div>

            <div className="vendorMenuContainer">
                <div className="categories">
                    {
                        categories.map((category) => {
                            const filteredFoodItems = foodItems.filter((foodItem) => foodItem.category === category.categoryName);
                            return (
                                <div className="category" key={category._id}>
                                    {
                                        categoryBeingUpdated === category._id ? (
                                            <form onSubmit={handleSubmit(handlecategoryUpdate)} className="category-header">
                                                <div className="category-line1">
                                                    <input
                                                        type="text"
                                                        placeholder="Category Name"
                                                        className='border-2 border-blue-300 rounded p-0.5'
                                                        defaultValue={category.categoryName}
                                                        {...register("categoryName", { required: true })}
                                                    />
                                                    <div className="category-cta">
                                                        <button type="submit">Update</button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setCategoryBeingUpdated(null);
                                                                reset();
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                                <textarea
                                                    placeholder="Category Description"
                                                    className='border-2 border-blue-300 rounded p-0.5'
                                                    defaultValue={category.categoryDescription}
                                                    {...register("categoryDescription", { required: true })}
                                                />
                                            </form>
                                        ) : (
                                            <div className="category-header">
                                                <div className="category-line1">
                                                    <h3>{category.categoryName}</h3>
                                                    <div className="category-cta">
                                                        <button onClick={() => setCategoryBeingUpdated(category._id)}>Edit</button>
                                                        <button onClick={() => deleteCategory(category._id)}>Delete</button>
                                                    </div>
                                                </div>
                                                <h4>{category.categoryDescription}</h4>
                                            </div>
                                        )
                                    }

                                    <div className="foods">
                                        {
                                            filteredFoodItems.map((foodItem) => {
                                                return (
                                                    <div className="food" key={foodItem._id}>
                                                        <div className="food-header">
                                                            <h3>{foodItem.foodName}</h3>
                                                            <div className="food-cta">
                                                                <button>Edit</button>
                                                            </div>
                                                        </div>
                                                        <h4>{foodItem.foodDescription}</h4>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                            )
                        })
                    }
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
                        <form onSubmit={handleSubmit(onSubmitCategory)}>
                            <input type="text" placeholder="Category Name" {...register("categoryName")} required />
                            <textarea placeholder="Food Description" {...register("categoryDescription")} required />
                            <div className="modal-buttons">
                                <button type="submit">Add Category</button>
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
