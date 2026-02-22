import { createBrowserRouter } from "react-router-dom";

import App from "./App";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Layout from "./components/Layout";
import ChatRedirect from "./pages/ChatRedirect";
import AdminDashboard from "./pages/AdminDashboard";

// Views
import Projects from "./views/Projects";
import Chat from "./views/Chat";
import Knowledge from "./views/Knowledge";
import ProjectBuilder from "./views/ProjectBuilder";

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
      {
        path: "admin",
        element: <AdminDashboard />,
      },
      // All routes are public — guest-first mode (like ChatGPT)
      // Auth is optional: logged-in users get persistence, guests get ephemeral sessions
      {
        element: <Layout />,
        children: [
          {
            index: true,
            element: <ChatRedirect />,
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
            path: "projects/:id/builder",
            element: <ProjectBuilder />,
          },
          {
            path: "knowledge",
            element: <Knowledge />,
          },
          {
            path: "settings",
            element: (
              <div className="p-8 text-center text-gray-500">
                Configuración (Próximamente)
              </div>
            ),
          },
        ],
      },
    ],
  },
]);
