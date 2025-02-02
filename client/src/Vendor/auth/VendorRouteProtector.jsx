import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

function VendorRouteProtector({ children, authentication = true }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);

    const authStatus = useSelector(state => state.auth.status);
    const role = useSelector(state => state.auth.role);

    useEffect(() => {
        if (authStatus === null) return; // Prevents redirecting before we have auth data
        
        if (authentication && !authStatus) {
            if (location.pathname !== "/vendor/auth/login") {
                navigate("/vendor/auth/login", { replace: true });
            }
        } else if (!authentication && authStatus) {
            if (location.pathname !== "/vendor") {
                navigate("/vendor", { replace: true });
            }
        }
        
        setLoading(false);
    }, [authStatus, authentication, navigate, location]);

    return loading ? <h1 className="text-red-700">Loading...</h1> : <>{children}</>;
}

export default VendorRouteProtector;
