import { createBrowserRouter } from "react-router-dom";
import { AuthLoader } from "./components/AuthLoader";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import ChatPage from "./pages/ChatPage";
import { AuditReport } from "./components/auditor/AuditReport";

import IntroWadi from "./pages/IntroWadi";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import DashboardPage from "./pages/DashboardPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <IntroWadi />,
  },
  {
    path: "/terminos",
    element: <TermsPage />,
  },
  {
    path: "/privacidad",
    element: <PrivacyPage />,
  },
  {
    path: "/login",
    element: (
      <AuthLoader>
        <Login />
      </AuthLoader>
    ),
  },
  {
    path: "/projects",
    element: (
      <AuthLoader>
        <Projects />
      </AuthLoader>
    ),
  },
  {
    path: "/projects/:id",
    element: (
      <AuthLoader>
        <ProjectDetail />
      </AuthLoader>
    ),
  },
  {
    path: "/chat",
    element: (
      <AuthLoader>
        <ChatPage />
      </AuthLoader>
    ),
  },
  {
    path: "/chat/:conversationId",
    element: (
      <AuthLoader>
        <ChatPage />
      </AuthLoader>
    ),
  },
  {
    path: "/chat/:conversationId/audit",
    element: (
      <AuthLoader>
        <AuditReport />
      </AuthLoader>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <AuthLoader>
        <DashboardPage />
      </AuthLoader>
    ),
  },
]);
