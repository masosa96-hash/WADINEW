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
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl shadow-black/5 border border-black/5 p-8 transform transition-all">
        
        <h2 className="text-xl font-medium text-wadi-text mb-1">
            New Project
        </h2>
        <p className="text-sm text-wadi-muted mb-6 font-light">
            Create a new workspace for your ideas.
        </p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-wadi-text">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-md focus:outline-none focus:bg-white focus:border-indigo-500/30 focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm"
              placeholder="e.g. Website Redesign"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-wadi-text">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-md focus:outline-none focus:bg-white focus:border-indigo-500/30 focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm resize-none"
              rows={3}
              placeholder="Optional description..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-wadi-muted hover:text-wadi-text hover:bg-gray-50 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-wadi-text text-white text-sm font-medium rounded-md hover:bg-black/90 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
