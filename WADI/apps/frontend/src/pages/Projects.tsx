import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useProjectsStore } from "../store/projectsStore";
import ProjectCard from "../components/ProjectCard";
import CreateProjectModal from "../components/CreateProjectModal";

export default function Projects() {
  const { user, signOut } = useAuthStore();
  const { projects, loading, error, fetchProjects } = useProjectsStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-2">
            My Projects
          </h1>
          <p className="text-slate-400 font-medium">
            Welcome back, <span className="text-slate-200">{user?.email}</span>
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <span>+</span> New Project
          </button>
          <button
            onClick={() => signOut()}
            className="btn-secondary"
          >
            Logout
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl mb-8 flex items-center gap-2">
           ⚠️ Error: {error}
        </div>
      )}

      {loading && projects.length === 0 ? (
        <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : (
        <>
          {projects.length === 0 ? (
            <div className="glass-panel text-center py-24 border-dashed border-2 border-slate-700/50">
              <h3 className="text-xl font-semibold text-slate-300 mb-2">No projects yet</h3>
              <p className="text-slate-500 mb-6 max-w-sm mx-auto">Start your journey by creating your first AI project implementation.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Create your first project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </>
      )}

      {showCreateModal && (
        <CreateProjectModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}

