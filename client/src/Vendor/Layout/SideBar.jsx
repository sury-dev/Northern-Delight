import React, { useState } from 'react'
import './SideBar.css'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, useNavigate } from 'react-router-dom'
import vendorService from '../../server/vendorService'
import { logout } from '../../app/slices/authSlice'

function SideBar() {

    const vendorData = useSelector(state => state.auth.userData);
    const vendorRole = useSelector(state => state.auth.role);

    const [showModal, setShowModal] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Function to handle logout
    const handleLogout = () => {
        vendorService.logoutVendor(vendorRole)
            .then((response) => {
                if (response && response.status === 200) {
                    dispatch(logout());
                    setShowModal(false);
                    navigate('/vendor/auth/login');
                }
                else {
                    console.log("User could not be logged out");
                }
            })
    };

    return (
        <>
            <div className="sideBar">
                <div className="profile-picture-section">
                    <div className="image-container" style={{ "--dimension": "100px", "--border-size": "3px" }}>
                        <img src={vendorData.avatar.url} alt="Profile" />
                    </div>
                    <div className="vendor-info">
                        <p>Welcome</p>
                        <h3>{vendorData.name}</h3>
                    </div>
                </div>
                <div className="divider"></div>
                <ul className="navUl">
                    {vendorRole === "admin" && <li>
                        <NavLink
                            to='/vendor'
                            end
                            className={({ isActive }) => (isActive ? 'navBtns active' : 'navBtns')}
                        >
                            <img src="/Dashboard.png" alt="Dashboard" />
                            Dashboard
                        </NavLink>
                    </li>}
                    <li>
                        <NavLink
                            to='/vendor/Orders'
                            className={({ isActive }) => (isActive ? 'navBtns active' : 'navBtns')}
                        >
                            <img src="/Orders.png" alt="Orders" />
                            Orders
                        </NavLink>
                    </li>
                    {vendorRole === "admin" && <li>
                        <NavLink
                            to='/vendor/employees'
                            className={({ isActive }) => (isActive ? 'navBtns active' : 'navBtns')}
                        >
                            <img src="/Employees.png" alt="Employees" />
                            Employees
                        </NavLink>
                    </li>}
                    {vendorRole === "admin" && <li>
                        <NavLink
                            to='/vendor/menu'
                            className={({ isActive }) => (isActive ? 'navBtns active' : 'navBtns')}
                        >
                            <img src="/Menu.png" alt="Menu" />
                            Menu
                        </NavLink>
                    </li>}
                    {vendorRole === "admin" && <li>
                        <NavLink
                            to='/vendor/coupons'
                            className={({ isActive }) => (isActive ? 'navBtns active' : 'navBtns')}
                        >
                            <img src="/Coupons.png" alt="Coupons" />
                            Coupons
                        </NavLink>
                    </li>}
                    {vendorRole === "admin" && <li>
                        <NavLink
                            to='/vendor/customers'
                            className={({ isActive }) => (isActive ? 'navBtns active' : 'navBtns')}
                        >
                            <img src="/Customers.png" alt="Customers" />
                            Customers
                        </NavLink>
                    </li>}
                </ul>
                <div className="divider pushToEnd"></div>
                <ul className="navUl">
                    <li>
                        <NavLink
                            to='/vendor/profile'
                            className={({ isActive }) => (isActive ? 'navBtns active' : 'navBtns')}
                        >
                            <img src="/Profile.png" alt="Profile" />
                            Profile
                        </NavLink>
                    </li>
                    {/* <li>
                        <NavLink
                            to='/vendor/settings'
                            className={({ isActive }) => (isActive ? 'navBtns active' : 'navBtns')}
                        >
                            <img src="/Settings.png" alt="Settings" />
                            Settings
                        </NavLink>
                    </li> */}
                    <li>
                        <button className="navBtns" onClick={() => setShowModal(true)}>
                            <img src="/Logout.png" alt="Logout" />
                            Logout
                        </button>
                    </li>
                </ul>
            </div>
            {showModal && <div className="modal-overlay" onClick={() => setShowModal(false)}>
                <div className="modal">
                    <h2>Confirm Logout</h2>
                    <p>Are you sure you want to logout?</p>
                    <div className="modal-actions">
                        <button onClick={handleLogout} className="confirm-btn">Yes</button>
                        <button onClick={() => setShowModal(false)} className="cancel-btn">Cancel</button>
                    </div>
                </div>
            </div>}
        </>
    )
}

export default SideBar
