import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import App from "./App";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Layout from "./components/Layout";

// Auth Guard
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { session } = useAuthStore();
  if (!session) return <Navigate to="/login" replace />;
  return children;
};

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
           // Redirect root to projects
           {
            path: "",
            element: <Navigate to="/projects" replace />,
           },
        ]
      },
    ],
  },
]);

