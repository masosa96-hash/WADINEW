import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { BackendHealthProvider } from './providers/BackendHealthProvider'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BackendHealthProvider>
      <RouterProvider router={router} />
    </BackendHealthProvider>
  </React.StrictMode>,
)
