import { useEffect, useState } from "react";
import { useProjectsStore } from "../store/projectsStore";
import { Link } from "react-router-dom";
import { Plus, Folder, ArrowRight, Loader2, LayoutGrid, LayoutList } from "lucide-react";

export default function Projects() {
  const { projects, fetchProjects, createProject, loading } = useProjectsStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [creating, setCreating] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    
    setCreating(true);
    try {
        await createProject(newProjectName, "User Created Project");
        setNewProjectName("");
        setShowCreate(false);
    } catch (error) {
        console.error("Create failed", error);
    } finally {
        setCreating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 text-wadi-text">
        <header className="flex justify-between items-end mb-8">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Folder className="w-6 h-6 text-wadi-muted" />
                    Proyectos
                </h1>
                <p className="text-wadi-muted mt-2">
                    Espacios de trabajo activos.
                </p>
            </div>
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                <button 
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-gray-600"}`}
                >
                    <LayoutGrid size={16} />
                </button>
                <button 
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-gray-600"}`}
                >
                    <LayoutList size={16} />
                </button>
            </div>
            <button 
                onClick={() => setShowCreate(true)}
                className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm"
            >
                <Plus size={16} />
                Nuevo Proyecto
            </button>
        </header>

        {/* Create Modal - Inline Overlay for ease */}
        {showCreate && (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white border border-gray-200 shadow-2xl rounded-2xl p-6 max-w-md w-full animate-in fade-in zoom-in duration-200">
                    <h3 className="text-lg font-bold mb-4">Nuevo Proyecto</h3>
                    <form onSubmit={handleCreate}>
                        <input 
                            autoFocus
                            type="text"
                            placeholder="Nombre del proyecto..."
                            className="w-full text-lg border-b border-gray-200 py-2 outline-none focus:border-black transition-colors mb-6 placeholder:font-light"
                            value={newProjectName}
                            onChange={e => setNewProjectName(e.target.value)}
                        />
                        <div className="flex justify-end gap-3">
                            <button 
                                type="button"
                                onClick={() => setShowCreate(false)}
                                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit"
                                disabled={!newProjectName.trim() || creating}
                                className="bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
                            >
                                {creating && <Loader2 className="animate-spin" size={14} />}
                                Crear
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {loading && projects.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-40 bg-gray-50 rounded-xl animate-pulse border border-gray-100" />
                ))}
            </div>
        ) : projects.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <Folder className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No hay proyectos</h3>
                <button onClick={() => setShowCreate(true)} className="text-black underline mt-2 text-sm font-medium">Crear el primero</button>
            </div>
        ) : (
            <>
                {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map(project => (
                            <Link 
                                key={project.id} 
                                to={`/projects/${project.id}`}
                                className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all flex flex-col h-48"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-black group-hover:bg-gray-100 transition-colors">
                                        <span className="font-bold text-lg">{project.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <ArrowRight size={16} className="text-gray-300 group-hover:text-black -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all" />
                                </div>
                                
                                <h3 className="font-bold text-lg truncate mb-1">{project.name}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
                                
                                <div className="mt-auto pt-4 flex gap-2">
                                     <span className="text-[10px] bg-gray-50 px-2 py-1 rounded text-gray-400">
                                        {new Date(project.created_at).toLocaleDateString()}
                                     </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        {projects.map((project, idx) => (
                           <Link key={project.id} to={`/projects/${project.id}`}>
                                <div className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${idx !== projects.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                     <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">
                                            {project.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{project.name}</h3>
                                            <p className="text-xs text-gray-500 max-w-md truncate">{project.description}</p>
                                        </div>
                                     </div>
                                     <div className="flex items-center gap-6">
                                         <span className="text-xs text-gray-400">{new Date(project.created_at).toLocaleDateString()}</span>
                                         <ArrowRight size={14} className="text-gray-300" />
                                     </div>
                                </div>
                           </Link>
                        ))}
                    </div>
                )}
            </>
        )}
    </div>
  );
}
