import { useEffect, useState } from "react";
import ProjectCard from "../../components/ProjectCard";
import CreateProjectModal from "../../components/CreateProjectModal";
import { useProjectsStore } from "../../store/projectsStore";

// Columns Definition
const COLUMNS = [
  { id: "PLANNING", label: "Planning", color: "bg-slate-500" }, /* Neutral */
  { id: "IN_PROGRESS", label: "In Progress", color: "bg-blue-500" }, /* Active */
  { id: "BLOCKED", label: "Blocked", color: "bg-red-500" }, /* Error */
  { id: "DONE", label: "Done", color: "bg-emerald-500" }, /* Success */
];

export default function ProjectBoard() {
  const { projects, fetchProjects } = useProjectsStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      
      {/* Kanban Actions */}
      <div className="flex justify-between items-center mb-8 shrink-0 px-2">
         <h2 className="text-lg font-medium text-wadi-text">Projects</h2>
         <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-wadi-text text-white rounded-md text-sm font-medium hover:bg-black/80 transition-colors shadow-sm"
        >
          New Project
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 px-2">
        <div className="h-full flex gap-8 min-w-max">
          {COLUMNS.map((col) => {
            const colProjects = projects.filter((p) => (p.status || "PLANNING") === col.id);
            
            return (
              <div key={col.id} className="w-72 flex flex-col h-full rounded-xl bg-gray-50/50">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 px-3 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${col.color}`} />
                    <h2 className="text-xs font-semibold text-wadi-muted uppercase tracking-wide">
                      {col.label}
                    </h2>
                  </div>
                  <span className="text-[10px] font-medium text-wadi-muted/60">
                    {colProjects.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto px-2 pb-2 flex flex-col gap-3 scrollbar-none">
                  {colProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                  
                  {colProjects.length === 0 && (
                    <div className="border border-dashed border-gray-200 rounded-lg p-8 text-center opacity-40">
                      <p className="text-sm text-wadi-muted font-light">Empty</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isCreateModalOpen && (
        <CreateProjectModal onClose={() => setIsCreateModalOpen(false)} />
      )}
    </div>
  );
}
