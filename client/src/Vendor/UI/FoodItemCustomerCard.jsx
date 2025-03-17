import React, { useState } from 'react'
import "./FoodItemCustomerCard.css";

function FoodItemCustomerCard({ name = "Samaosa", description = "Good Crispy Samosa", price = "10", ingredients, availability = true, imageUrl = "https://imgs.search.brave.com/gGdDeyrLuXWBjr13dn3o3XfWOCpQIhK15WOb0Mi2NzI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAxLzE1LzY1LzY1/LzM2MF9GXzExNTY1/NjU0Ml8yOUNYN0NH/UFh1ZFNiM0RUcDI1/aGNRRFplbzNkamlU/Yy5qcGc" }) {

    const [quantity, setQuantity] = useState(1);

    return (
        <div className="food-item-customer-card">
            <div className="food-item-customer-card-image">
                <img src={imageUrl} alt="Food Item" />
            </div>
            <div className="food-item-customer-card-details">
                <div className="nameAndPrice">
                    <h3>{name}</h3>
                    <p>Rs. {price}</p>
                </div>
                <p>{description}</p>
                <div className="quantityAndCTA">
                    {availability ? (<div className="food-item-customer-card-quantity">
                        <button onClick={() => {
                            if (quantity > 1) {
                                setQuantity(quantity - 1);
                            }
                        }}>-</button>
                        <span>{quantity}</span>
                        <button onClick={() => {
                            setQuantity(quantity + 1);
                        }}>+</button>
                    </div>) : (<></>)}
                    {availability ? (<button className='AddToCart'>Add To Cart</button>) : (<button className='AddToCart' disabled>Out Of Stock</button>)}
                </div>
            </div>
        </div>
    )
}

export default FoodItemCustomerCard
