import React from 'react'
import { SideBar } from '../Layout'
import './VendorDashboard.css'
import { Outlet } from 'react-router-dom'

function VendorDashboard() {
    return (
        <div className='vendorPage'>
            <div id='leaf1'></div>
            <div id='leaf2'></div>
            <div id='leaf3'></div>
            <div id='leaf4'></div>
            <SideBar />
            <div className='vendorContent'>
                <Outlet />
            </div>
        </div>
    )
}

export default VendorDashboard
