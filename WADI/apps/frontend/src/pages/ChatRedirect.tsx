import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectsStore } from "../store/projectsStore";
import { useAuthStore } from "../store/useAuthStore";

export default function ChatRedirect() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { projects, fetchProjects, createProject, loading, error } = useProjectsStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Guest mode — skip projects entirely, go to ephemeral chat
    if (!user) {
      navigate("/projects/guest", { replace: true });
      return;
    }

    // Authenticated user — load their projects
    fetchProjects();
  }, [user, fetchProjects, navigate]);

  useEffect(() => {
    if (!user) return; // guests already redirected above
    if (loading) return;
    if (error) return;

    if (projects.length > 0) {
      navigate(`/projects/${projects[0].id}`, { replace: true });
    } else if (!loading && !error && projects.length === 0 && initialized.current) {
      // Authenticated user with no projects — auto-create GENERAL
      createProject("GENERAL", "Default Operational Context").catch((e) =>
        console.error("Failed to auto-create GENERAL project", e)
      );
    }
  }, [user, projects, loading, error, navigate, createProject]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-wadi-error">
        Error al cargar los proyectos. Reintenta más tarde.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full bg-wadi-base text-white font-mono animate-pulse">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-t-wadi-accent border-r-wadi-accent/50 border-b-wadi-muted/20 border-l-wadi-muted/20 rounded-full animate-spin" />
        <div className="text-xs tracking-widest uppercase">
          {projects.length === 0 && !loading ? "INITIALIZING_DEFAULT_CONTEXT..." : "LOCATING_CONTEXT..."}
        </div>
      </div>
    </div>
  );
}
