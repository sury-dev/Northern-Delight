import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './VendorMenuComponent.css'

function VendorMenuComponent() {
    const [searchTerm, setSearchTerm] = useState("");
    const vendorRole = useSelector(state => state.auth.role);
    const navigate = useNavigate();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (vendorRole !== "admin") {
            navigate('/vendor/Orders');
        } else {
            setIsAuthorized(true);
        }
    }, [vendorRole, navigate]);

    if (!isAuthorized) {
        return null; // Prevents rendering if unauthorized
    }

    return (
        <div className="vendorMenuComponent w-full h-full relative">{/*  */}
            <div className="header"> {/* CSS in EmployeeComponent.css  */}
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
            </div>
        </div>
    )
}

export default VendorMenuComponent
