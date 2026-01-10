import { Link } from "react-router-dom";

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
}

export default function ProjectCard({ project }: { project: Project }) {
  const statusColors = {
    active: "bg-green-500/20 text-green-300 border-green-500/30",
    archived: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    default: "bg-blue-500/20 text-blue-300 border-blue-500/30"
  };

  const statusClass = statusColors[project.status as keyof typeof statusColors] || statusColors.default;

  return (
    <Link
      to={`/projects/${project.id}`}
      className="glass-panel p-6 hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex justify-between items-start mb-3 relative">
        <h3 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent truncate pr-4">
          {project.name}
        </h3>
        <span className={`text-xs px-2.5 py-1 rounded-full border ${statusClass} font-medium uppercase tracking-wide`}>
          {project.status || 'Active'}
        </span>
      </div>
      
      <p className="text-slate-400 text-sm mb-6 line-clamp-2 h-10 relative">
        {project.description || "No description provided."}
      </p>
      
      <div className="flex justify-between items-center text-xs text-slate-500 border-t border-slate-700/50 pt-4 relative">
        <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
        <span className="text-blue-400 group-hover:translate-x-1 transition-transform">
          Open Project &rarr;
        </span>
      </div>
    </Link>
  );
}
