import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectsStore } from "../store/projectsStore";

export default function ChatRedirect() {
  const navigate = useNavigate();
  const { projects, fetchProjects, createProject, loading, error } = useProjectsStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
        initialized.current = true;
        fetchProjects();
    }
  }, [fetchProjects]);

  useEffect(() => {
    // If loading or error, do nothing yet
    if (loading) return;
    if (error) {
      // If there's an error, we stop further execution of this useEffect.
      // The error message will be displayed by the component's main return block.
      return;
    }

    // Check if projects are loaded
    if (projects.length > 0) {
        // STRATEGY: Select the most recent one (first in list usually)
        // Future: Check localStorage for 'lastActiveProjectId'
        const targetProject = projects[0];
        navigate(`/projects/${targetProject.id}`, { replace: true });
    } else if (!loading && !error && projects.length === 0 && initialized.current) {
        // NO PROJECTS FOUND -> Auto-create GENERAL
        const initGeneral = async () => {
             try {
                // We don't await the navigate here because createProject updates store,
                // triggering this useEffect again? 
                // No, better to handle it explicitly to avoid loops.
                await createProject("GENERAL", "Default Operational Context");
                // Store update will trigger the `projects.length > 0` block above?
                // `createProject` updates the state, so `projects` dependency changes.
                // The next render will hit the `if (projects.length > 0)` block.
             } catch (e) {
                 console.error("Failed to auto-create GENERAL project", e);
             }
        };
        initGeneral();
    }
  }, [projects, loading, error, navigate, createProject]);

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
      <div className="w-12 h-12 border-2 border-t-wadi-accent border-r-wadi-accent/50 border-b-wadi-muted/20 border-l-wadi-muted/20 rounded-full animate-spin"></div>
      <div className="text-xs tracking-widest uppercase">
        {projects.length === 0 && !loading ? "INITIALIZING_DEFAULT_CONTEXT..." : "LOCATING_CONTEXT..."}
      </div>
    </div>
  </div>
);
}
