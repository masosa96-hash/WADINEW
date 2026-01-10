import { useEffect, useRef } from "react";
import { useProjectsStore } from "../store/projectsStore";
import { useNavigate } from "react-router-dom";

export default function Projects() {
  const { projects, loading, fetchProjects, createProject } = useProjectsStore();
  const navigate = useNavigate();
  const initRef = useRef(false);

  useEffect(() => {
    // Prevent double execution in strict mode
    if (initRef.current) return;
    initRef.current = true;
    
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    // Once projects are loaded (or if empty list returned)
    if (!loading) {
      const generalProject = projects.find(p => p.name === "GENERAL");
      
      if (generalProject) {
        // Redirect immediately if found
        navigate(`/projects/${generalProject.id}`, { replace: true });
      } else {
        // If not found (and we aren't already trying to create one), create it
        // We use a timeout to avoid immediate race conditions or loops if create fails
        const initGeneral = async () => {
          try {
            // Check again just in case
            const existing = projects.find(p => p.name === "GENERAL");
            if (existing) {
               navigate(`/projects/${existing.id}`, { replace: true });
               return;
            }

            console.log("Creating default GENERAL project...");
            await createProject({ name: "GENERAL", description: "Default Chat Space" });
            // The store updates 'projects', so this effect will run again and find it
          } catch (e) {
            console.error("Failed to create general project", e);
          }
        };
        initGeneral();
      }
    }
  }, [projects, loading, navigate, createProject]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-white">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-slate-400 font-mono text-sm tracking-widest animate-pulse">
        CONNECTING TO WADI...
      </p>
    </div>
  );
}

