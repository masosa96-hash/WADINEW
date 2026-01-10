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
    <div className="container mx-auto px-4 py-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Projects</h1>
          <p className="text-gray-400 text-sm">Welcome, {user?.email}</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow"
          >
            + New Project
          </button>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 rounded"
          >
            Logout
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 p-4 rounded mb-6">
          Error: {error}
        </div>
      )}

      {loading && projects.length === 0 ? (
        <div className="text-center text-gray-500 py-12">Loading projects...</div>
      ) : (
        <>
          {projects.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-700 rounded-lg">
              <p className="text-gray-500 mb-4">You haven't created any projects yet.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded border border-gray-600"
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

