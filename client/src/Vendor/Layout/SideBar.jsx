import React from 'react'
import './SideBar.css'
import { useSelector } from 'react-redux'
import { NavLink } from 'react-router-dom'

function SideBar() {

    const vendorData = useSelector(state => state.auth.userData);
    const vendorRole = useSelector(state => state.auth.role);

    return (
        <div className="sideBar">
            <div className="profile-picture-section">
                <div className="image-container" style={{ "--dimension" : "100px", "--border-size": "3px" }}>
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
        </div>
    )
}

export default SideBar
