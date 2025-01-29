import React from 'react'
import { Outlet } from 'react-router-dom'
import './VendorAuth.css'

function VendorAuth() {
    return (
        <div className='full-container auth-page'>
            <div id='leaf1'></div>
            <div id='leaf2'></div>
            <Outlet />
            <div id='leaf3'></div>
            <div id='leaf4'></div>
        </div>
    );
}

export default VendorAuth
