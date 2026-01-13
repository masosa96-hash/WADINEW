import { useState } from "react";
import { useProjectsStore } from "../store/projectsStore";

interface Props {
  onClose: () => void;
}

export default function CreateProjectModal({ onClose }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { createProject, loading, error } = useProjectsStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject(name, description);
      onClose();
    } catch (err) {
      // Error handled in store state
    }
  };

  return (
    <div className="fixed inset-0 bg-wadi-base/90 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="wadi-panel p-8 w-full max-w-md relative overflow-hidden bg-wadi-base border-wadi-border shadow-2xl">
        
        <h2 className="text-lg font-mono font-bold mb-6 text-wadi-text uppercase tracking-widest">
            INITIALIZE_PROJECT
        </h2>
        
        {error && (
          <div className="bg-wadi-error/10 border border-wadi-error/50 text-wadi-error p-3 rounded mb-4 text-xs font-mono">
            ERROR: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-xs font-mono text-wadi-muted uppercase">Project Designation</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="wadi-input w-full"
              placeholder="PROJECT_CODENAME"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block mb-2 text-xs font-mono text-wadi-muted uppercase">Scope / Context</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="wadi-input w-full resize-none"
              rows={3}
              placeholder="Define operational parameters..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-wadi-border/50">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              ABORT
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "INITIALIZING..." : "EXECUTE"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
