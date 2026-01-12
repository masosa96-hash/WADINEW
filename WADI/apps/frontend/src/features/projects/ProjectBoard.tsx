import { useEffect } from "react";
import ProjectCard from "../../components/ProjectCard";
import { useProjectsStore } from "../../store/projectsStore";

// Columns Definition
const COLUMNS = [
  { id: "PLANNING", label: "Planning", color: "bg-slate-100" },
  { id: "IN_PROGRESS", label: "In Progress", color: "bg-blue-50" },
  { id: "BLOCKED", label: "Blocked", color: "bg-red-50" },
  { id: "DONE", label: "Done", color: "bg-emerald-50" },
];

export default function ProjectBoard() {
  const { projects, fetchProjects } = useProjectsStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <header className="px-8 py-6 border-b border-slate-200 bg-white flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Projects</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your initiatives and tasks.</p>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm active:scale-95">
          + New Project
        </button>
      </header>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="h-full flex px-8 py-8 gap-6 min-w-max">
          {COLUMNS.map((col) => {
            const colProjects = projects.filter((p) => (p.status || "PLANNING") === col.id);
            
            return (
              <div key={col.id} className="w-80 flex flex-col h-full">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.color.replace('bg-', 'bg-').replace('50', '400')}`} />
                    <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                      {col.label}
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                    {colProjects.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto pr-2 pb-4 flex flex-col gap-3">
                  {colProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                  
                  {colProjects.length === 0 && (
                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
                      <p className="text-sm text-slate-400">No projects</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
