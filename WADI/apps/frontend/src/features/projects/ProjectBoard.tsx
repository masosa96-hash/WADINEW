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
      <div className="flex justify-between items-center mb-6 shrink-0">
         <h2 className="text-sm font-mono text-wadi-muted uppercase tracking-wider">Operational View</h2>
         <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary"
        >
          + Initialize Project
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-2">
        <div className="h-full flex gap-6 min-w-max">
          {COLUMNS.map((col) => {
            const colProjects = projects.filter((p) => (p.status || "PLANNING") === col.id);
            
            return (
              <div key={col.id} className="w-80 flex flex-col h-full bg-wadi-surface/30 rounded-lg p-2 border border-wadi-border/50">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-2 py-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.color}`} />
                    <h2 className="text-xs font-mono font-bold text-wadi-text uppercase tracking-wider">
                      {col.label}
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-wadi-muted bg-wadi-base px-2 py-0.5 rounded border border-wadi-border">
                    {colProjects.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto px-1 pb-2 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-wadi-border">
                  {colProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                  
                  {colProjects.length === 0 && (
                    <div className="border border-dashed border-wadi-border rounded p-6 text-center opacity-50">
                      <p className="text-xs font-mono text-wadi-muted">NO_ACTIVE_TASKS</p>
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
