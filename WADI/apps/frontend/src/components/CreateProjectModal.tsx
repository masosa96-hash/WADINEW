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
      // Error handled in store state usually, but we also catch for UI flow
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="glass-panel p-8 w-full max-w-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
        
        <h2 className="text-2xl font-bold mb-6 text-white">Create New Project</h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-300">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input w-full text-white placeholder-slate-500"
              placeholder="e.g., Quantum AI Rewrite"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-300">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-input w-full text-white placeholder-slate-500 resize-none"
              rows={3}
              placeholder="Briefly describe your goals..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
