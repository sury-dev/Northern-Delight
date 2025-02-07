import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function VendorOrders() {
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

  return (
    <div>
      Orders
    </div>
  )
}

export default VendorOrders
