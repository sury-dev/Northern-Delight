import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

function VendorRouteProtector({ children, authentication = true }) {

    const navigate = useNavigate()
    const [loader, setLoader] = useState(true)
    const authStatus = useSelector(state => state.auth.status)

    useEffect(() => {
        console.log(authentication, authStatus)
        if (authentication && authStatus !== authentication) {
            navigate("vendor/auth/login")
        } else if (!authentication && authStatus !== authentication) {
            navigate("/vendor")
        }
        setLoader(false)
    }, [authStatus, navigate, authentication])

    return loader ? <h1 style={{height: '1vh'}} className='text-red-700'>Loading...</h1> : <>{children}</>
}

export default VendorRouteProtector
