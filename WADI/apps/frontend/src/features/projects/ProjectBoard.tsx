import { useEffect, useState } from "react";
import ProjectCard from "../../components/ProjectCard";
import CreateProjectModal from "../../components/CreateProjectModal";
import { useProjectsStore } from "../../store/projectsStore";
import { CheckSquare, Square, Trash2 } from "lucide-react";

// Columns Definition
const COLUMNS = [
  { id: "PLANNING", label: "Planning", color: "bg-slate-500" }, /* Neutral */
  { id: "IN_PROGRESS", label: "In Progress", color: "bg-blue-500" }, /* Active */
  { id: "BLOCKED", label: "Blocked", color: "bg-red-500" }, /* Error */
  { id: "DONE", label: "Done", color: "bg-emerald-500" }, /* Success */
];

export default function ProjectBoard() {
  const { projects, fetchProjects, deleteSelectedProjects } = useProjectsStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Bulk Action State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Handlers
  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;
    await deleteSelectedProjects(selectedIds);
    setShowDeleteConfirm(false);
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden relative">
      
      {/* Kanban Actions */}
      <div className="flex justify-between items-center mb-8 shrink-0 px-2">
         <div className="flex items-center gap-4">
            <h2 className="text-lg font-medium text-wadi-text">Projects</h2>
            
            {/* Bulk Selection Toggle */}
            <button
               onClick={() => {
                   setIsSelectionMode(!isSelectionMode);
                   setSelectedIds([]); // Clear on toggle
               }}
               className={`p-2 rounded-lg transition-colors ${isSelectionMode ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
               title="Gestionar Proyectos"
            >
                {isSelectionMode ? <CheckSquare size={18} /> : <Square size={18} />}
            </button>

            {/* Delete Action */}
            {isSelectionMode && selectedIds.length > 0 && (
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors animate-in fade-in slide-in-from-left-2"
                >
                    <Trash2 size={14} />
                    <span>Borrar ({selectedIds.length})</span>
                </button>
            )}
         </div>

         <button 
          onClick={() => setIsCreateModalOpen(true)}
          disabled={isSelectionMode} // Disable creation while managing
          className={`px-4 py-2 bg-wadi-text text-white rounded-md text-sm font-medium hover:bg-black/80 transition-colors shadow-sm ${isSelectionMode ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                    <ProjectCard 
                        key={project.id} 
                        project={project}
                        isSelectionMode={isSelectionMode}
                        isSelected={selectedIds.includes(project.id)}
                        onToggle={toggleSelection}
                    />
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

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateProjectModal onClose={() => setIsCreateModalOpen(false)} />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 max-w-sm w-full text-center transform transition-all scale-100">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">¿Eliminar {selectedIds.length} proyectos?</h3>
                <p className="text-sm text-gray-500 mb-6">
                    Esta acción es irreversible. Se perderán todos los datos asociados.
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors text-sm"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleDelete}
                        className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors text-sm shadow-lg shadow-red-200"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
