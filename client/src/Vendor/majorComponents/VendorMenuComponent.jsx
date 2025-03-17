import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { set, useForm } from 'react-hook-form';
import './VendorMenuComponent.css';
import vendorService from '../../server/vendorService';
import { FoodItemCustomerCard } from '../UI';

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

    const [imagePreview, setImagePreview] = useState("https://imgs.search.brave.com/gGdDeyrLuXWBjr13dn3o3XfWOCpQIhK15WOb0Mi2NzI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAxLzE1LzY1LzY1/LzM2MF9GXzExNTY1/NjU0Ml8yOUNYN0NH/UFh1ZFNiM0RUcDI1/aGNRRFplbzNkamlU/Yy5qcGc");
    const [ingredients, setIngredients] = useState([]);
    const [ingredientInput, setIngredientInput] = useState("");

    const { register, handleSubmit, reset, watch } = useForm();
    const [foodItems, setFoodItems] = useState([]);


    const handleSearch = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        console.log("Here")
        if (file) {
            const newImageUrl = URL.createObjectURL(file);
            console.log("Selected File:", file);
            console.log("Generated Preview URL:", newImageUrl);
            setImagePreview(newImageUrl);
        }
    };


    const addIngredient = () => {
        if (ingredientInput.trim()) {
            setIngredients([...ingredients, ingredientInput.trim()]);
            setIngredientInput("");
        }
    };

    const removeIngredient = (index) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
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

    const fetchFoodItems = async () => {
        const fetchedFoodItems = await vendorService.fetchFoodItems();
        if (fetchedFoodItems && fetchedFoodItems.status === 200) {
            setFoodItems(fetchedFoodItems.data.data);
        }
    }


    const handlecategoryUpdate = async (data) => {
        console.log("Updating Category:", data);
        // Update the categories using _id from categoryBeingUpdated
        const response = await vendorService.updateFoodCategory({ categoryId: categoryBeingUpdated, ...data });
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
        // Fetch all food items
        fetchFoodItems();
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

    const onSubmitFood = async (data) => {
        const obj = {
            ...data,
            ingredients,
            image: data.image[0]
        };
        console.log("New Food Item:", obj);
        const response = await vendorService.createFoodItem({ ...obj });
        if (response && response.status === 201) {
            setFoodItems([response.data.data, ...foodItems]);
        } else {
            console.error("Error creating food item:", response);
            // return;
        }
        setIngredients([]);
        setIngredientInput("");
        reset();
        closeFoodModal();

    };

    const onSubmitCategory = async (data) => {
        console.log("New Category:", data);
        const response = await vendorService.createFoodCategory({ ...data });
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
                            const filteredFoodItems = foodItems.filter((foodItem) => foodItem.category === category._id);
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
                                                    <FoodItemCustomerCard key={foodItem._id} {...foodItem} imageUrl={foodItem.image.url} />
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
                    <div className="add-food-menu-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="food-item-preview">
                            <FoodItemCustomerCard
                                availability={true}
                                name={watch("name", "Title Here")}
                                description={watch("description", "Description Here")}
                                price={watch("price", 99)}
                                imageUrl={imagePreview} />
                        </div>
                        <form onSubmit={handleSubmit(onSubmitFood)}>
                            <h2>Add a Food Item</h2>
                            {/* Image Upload */}
                            <input
                                type="file"
                                id="image"
                                accept="image/*"
                                {...register("image", {
                                    required: true,
                                    onChange: (e) => handleImageChange(e) // Ensuring file is set
                                })}
                            />
                            <input type="text" placeholder="Food Name" {...register("name")} required />
                            <textarea placeholder="Food Description" {...register("description")} required />
                            <select {...register("category")} required>
                                <option value="">Select Category</option>
                                {categories.map((category) => (
                                    <option key={category._id} value={category._id}>{category.categoryName}</option>
                                ))}
                            </select>
                            <input type="number" placeholder="Price" {...register("price")} required />
                            <input type="number" placeholder="Investment Amount" {...register("investmentAmount")} required />
                            <input
                                type="number"
                                placeholder="Profit"
                                value={
                                    watch("price") && watch("investmentAmount")
                                        ? watch("price", 0) - watch("investmentAmount", 0)
                                        : ""
                                }
                                disabled
                                {...register("profit")}
                            />




                            {/* Ingredients Input */}
                            <div className="ingredients-section">
                                <input type="text" placeholder="Add Ingredient"
                                    value={ingredientInput}
                                    onChange={(e) => setIngredientInput(e.target.value)} />
                                <button type="button" onClick={addIngredient}>Add</button>
                            </div>
                            <ul className="ingredient-list">
                                {ingredients.map((ing, index) => (
                                    <li key={index} className="ingredient-item">
                                        <span>{ing}</span>
                                        <button type="button" className="remove-ingredient" onClick={() => removeIngredient(index)}>✖</button>
                                    </li>
                                ))}
                            </ul>

                            {/* Buttons */}
                            <div className="modal-buttons">
                                <button type="submit">Add Food Item</button>
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
