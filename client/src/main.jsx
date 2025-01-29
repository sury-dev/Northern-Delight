import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './app/store/store.js'
import './index.css'
import App from './App.jsx'
import Vendor from './Vendor.jsx'
import { VendorAuth, VendorDashboard } from './Vendor/pages/index.js'
import VendorRouteProtector from './Vendor/auth/VendorRouteProtector.jsx'
import { VendorLoginComponent, VendorSignupComponent } from './Vendor/majorComponents/index.js'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },
  {
    path: '/vendor',
    element: <Vendor />,
    children: [
      {
        path: 'auth',
        element: <VendorAuth />,
        children : [
          {
            path : 'login',
            element : <VendorRouteProtector authentication={false}><VendorLoginComponent /></VendorRouteProtector>
          },
          {
            path : 'register',
            element : <VendorRouteProtector authentication={false}><VendorSignupComponent /></VendorRouteProtector>
          }
        ]
      },
      {
        path : '',
        element : <VendorRouteProtector authentication={false}><VendorDashboard /></VendorRouteProtector>
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
)
