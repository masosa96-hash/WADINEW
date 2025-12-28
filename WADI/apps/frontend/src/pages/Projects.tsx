import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useProjectsStore } from "../store/projectsStore";
import { Layout } from "../components/Layout";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { Modal } from "../components/common/Modal";

// Define interface for project with extra fields if not in store type
interface ProjectWithMetrics {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  noise_count?: number;
  total_items_audited?: number;
}

export default function Projects() {
  const { projects, fetchProjects, createProject, loading } =
    useProjectsStore();
// ...
 // (inside render)
                  {/* Smoke Index Calculation */}
                    {(() => {
                      const pWithMetrics = p as unknown as ProjectWithMetrics;
                      const noise = pWithMetrics.noise_count || 0;
                      const total = pWithMetrics.total_items_audited || 0;
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError("El nombre es obligatorio");
      return;
    }

    setNameError("");

    try {
      await createProject(name, desc);
      setName("");
      setDesc("");
      setIsCreating(false);
    } catch (err) {
      console.error("Error creating project:", err);
    }
  };

  const openCreateModal = () => {
    setNameError("");
    setIsCreating(true);
  };

  return (
    <Layout>
      <div className="w-full max-w-5xl mx-auto p-8 min-h-full">
        {/* Header simple */}
        <header className="flex justify-end mb-8"></header>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-tr from-[#38bdf8] to-[#84cc16] rounded-full mx-auto mb-6 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(56,189,248,0.3)] animate-in zoom-in duration-500">
            🚀
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500">
            Punto de Control
          </h1>
          <p className="text-slate-500 text-lg">¿En qué trabajamos hoy?</p>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Card 1: New Project */}
          <button
            onClick={openCreateModal}
            className="flex flex-col gap-4 items-start text-left p-8 rounded-3xl border border-purple-100 bg-white/60 backdrop-blur-md shadow-sm transition-all hover:scale-[1.02] hover:shadow-lg hover:border-purple-200 group"
          >
            <div className="text-3xl p-3 bg-purple-50 rounded-2xl group-hover:bg-purple-100 transition-colors">
              ✨
            </div>
            <div>
              <span className="block text-xl font-bold text-slate-800 mb-2">
                Crear nuevo proyecto
              </span>
              <span className="text-sm text-slate-500 leading-relaxed">
                Inicia una nueva sesión de trabajo desde cero.
              </span>
            </div>
          </button>

          {/* Card 2: Explore */}
          <div className="flex flex-col gap-4 items-start text-left p-8 rounded-3xl border border-slate-100 bg-white/40 backdrop-blur-sm opacity-80">
            <div className="text-3xl p-3 bg-slate-50 rounded-2xl grayscale">
              📚
            </div>
            <div>
              <span className="block text-xl font-bold text-slate-700 mb-2">
                Explorar recursos
              </span>
              <span className="text-sm text-slate-500 leading-relaxed">
                Documentación y guías (Próximamente).
              </span>
            </div>
          </div>
        </div>

        {/* Recent Projects List */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest pl-2">
            Recientes
          </h3>

          {loading && (
            <p className="text-slate-400 pl-2 animate-pulse">
              Sincronizando...
            </p>
          )}

          <div className="flex flex-col gap-4">
            {projects.map((p) => (
              <Link
                key={p.id}
                to={`/projects/${p.id}`}
                className="no-underline"
              >
                <div className="group p-6 flex items-center justify-between rounded-3xl border border-white/50 bg-white/70 backdrop-blur-md shadow-sm transition-all hover:shadow-md hover:bg-white hover:scale-[1.01]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl group-hover:bg-purple-50 group-hover:text-purple-500 transition-colors">
                      📄
                    </div>
                    <div>
                      <div className="font-semibold text-base text-slate-800 mb-1 group-hover:text-purple-600 transition-colors">
                        {p.name}
                      </div>
                      {p.description && (
                        <div className="text-sm text-slate-500">
                          {p.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                      {new Date(p.created_at).toLocaleDateString()}
                    </span>

                    {/* Smoke Index Calculation */}
                    {(() => {
                      const pWithMetrics = p as unknown as ProjectWithMetrics;
                      const noise = pWithMetrics.noise_count || 0;
                      const total = pWithMetrics.total_items_audited || 0;
                      const percentage =
                        total > 0 ? Math.round((noise / total) * 100) : 0;

                      let colorClass = "text-purple-500 bg-purple-50";

                      if (percentage > 50) {
                        colorClass = "text-red-500 bg-red-50 animate-pulse";
                      } else if (percentage > 20) {
                        colorClass = "text-amber-500 bg-amber-50";
                      }

                      return (
                        <span
                          className={`text-[10px] font-mono px-3 py-1 rounded-full ${colorClass}`}
                        >
                          HUMO: {percentage}%
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </Link>
            ))}

            {projects.length === 0 && !loading && (
              <div className="text-center py-16 px-8 bg-white/30 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center gap-4">
                <div className="text-4xl">🌱</div>
                <h3 className="text-lg font-medium text-slate-700">
                  Tu espacio está limpio
                </h3>
                <p className="text-slate-500 max-w-xs mx-auto">
                  Aún no tienes proyectos. ¡Es hora de empezar algo nuevo!
                </p>
                <Button
                  onClick={openCreateModal}
                  variant="primary"
                  className="mt-4 shadow-lg shadow-purple-200"
                >
                  🚀 Creá tu primer proyecto
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Modal for Creating Project */}
        <Modal
          isOpen={isCreating}
          onClose={() => setIsCreating(false)}
          title="Nuevo Proyecto"
        >
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Input
              label="Nombre del proyecto"
              placeholder="Ej. Análisis de datos"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) setNameError("");
              }}
              error={nameError}
              autoFocus
            />
            <Input
              label="Descripción (opcional)"
              placeholder="Breve descripción del objetivo"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />

            <div className="flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreating(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200"
              >
                Crear Proyecto
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}
