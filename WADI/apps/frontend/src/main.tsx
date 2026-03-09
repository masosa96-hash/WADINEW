import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { router } from './router'
import { BackendHealthProvider } from './providers/BackendHealthProvider'
import './index.css'

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BackendHealthProvider>
        <RouterProvider router={router} />
      </BackendHealthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
