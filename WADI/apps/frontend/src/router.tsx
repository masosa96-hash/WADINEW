import { createBrowserRouter } from "react-router-dom";

import App from "./App";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Layout from "./components/Layout";
import ChatRedirect from "./pages/ChatRedirect";

// New Views
import Projects from "./views/Projects";
import Chat from "./views/Chat";
import Knowledge from "./views/Knowledge";

import ProtectedRoute from "./components/ProtectedRoute.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      // Authenticated Routes wrapped in Layout
      {
        element: (
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        ),
        children: [
           {
             index: true,
             element: <ChatRedirect />
           },
           {
            path: "projects",
            element: <Projects />,
           },
           {
            path: "projects/:id",
            element: <Chat />,
           },
           {
            path: "knowledge",
            element: <Knowledge />,
           },
           {
            path: "settings",
            element: <div className="p-8 text-center text-gray-500">Configuración (Próximamente)</div> // Placeholder
           }
        ],
      },
    ],
  },
]);

