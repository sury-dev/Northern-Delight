import React, {useEffect, useState} from 'react'
import './Vendor.css'
import vendorService from './server/vendorService'
import { login, logout } from './app/slices/authSlice'
import { useDispatch } from 'react-redux'
import { Outlet, useNavigate } from 'react-router-dom'

function Vendor({children}) {

  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()

  useEffect(() => {
    vendorService.getCurrentVendor()
      .then((userData) => {
        if (userData && userData.status === 200) {
          dispatch(login({ userData: userData.data.data, role: userData.role }))
        }
        else{
          dispatch(logout())
        }
      })
      .catch((error) => {
        console.log("App :: useEffect :: error :: ", error)
      })
      .finally(() => setLoading(false))
  })

  //store control and checking of authentication status

  return loading ? <h1 style={{height: '1vh'}}>Loading...</h1> : <Outlet />
}

export default Vendor
