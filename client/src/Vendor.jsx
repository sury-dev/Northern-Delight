import React, {useState} from 'react'
import './Vendor.css'
import { Outlet, useNavigate } from 'react-router-dom'

function Vendor() {

  const [loading, setLoading] = useState(false)

  //store control and checking of authentication status

  return loading ? <h1 style={{height: '1vh'}}>Loading...</h1> : <Outlet />
}

export default Vendor
