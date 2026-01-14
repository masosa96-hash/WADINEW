import { createBrowserRouter } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import App from "./App";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Layout from "./components/Layout";
import ChatRedirect from "./pages/ChatRedirect";

import ProtectedRoute from "./components/ProtectedRoute";

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
            path: "projects",
            element: <Projects />,
           },
           {
            path: "projects/:id",
            element: <ProjectDetail />,
           },
           {
            path: "chat",
            element: <ChatRedirect />,
           },
           // Redirect root to ChatRedirect
           {
            path: "",
            element: <ChatRedirect />,
           },
        ]
      },
    ],
  },
]);

