import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'


function App() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/vendor');
  }, [])
  return (
    <div>
      <h1 className='text-red-600'>jhgljhgkj</h1>
    </div>
  )
}

export default App
