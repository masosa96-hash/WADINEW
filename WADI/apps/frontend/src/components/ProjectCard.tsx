import { Link } from "react-router-dom";

// Mapping statuses to Badge colors
const STATUS_STYLES: Record<string, string> = {
  PLANNING: "bg-wadi-surface text-wadi-muted border-wadi-border",
  IN_PROGRESS: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  BLOCKED: "bg-red-500/10 text-red-500 border-red-500/20",
  COMPLETED: "bg-green-500/10 text-green-500 border-green-500/20",
  ARCHIVED: "bg-wadi-surface text-wadi-muted border-wadi-border",
};

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
}

export default function ProjectCard({ project }: { project: Project }) {
  const statusStyle = STATUS_STYLES[project.status] || STATUS_STYLES.PLANNING;

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group block bg-wadi-base rounded border border-wadi-border p-3 hover:border-wadi-text/30 transition-all duration-150 active:scale-[0.99]"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-mono font-medium text-wadi-text group-hover:text-wadi-accent transition-colors truncate pr-2">
          {project.name}
        </h3>
        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono uppercase tracking-wider ${statusStyle}`}>
          {project.status === 'IN_PROGRESS' ? 'ACTIVE' : project.status || 'PLAN'}
        </span>
      </div>
      
      <p className="text-wadi-muted text-xs mb-3 line-clamp-2 h-8 leading-relaxed font-sans">
        {project.description || "No description provided."}
      </p>
      
      <div className="flex justify-between items-center pt-2 border-t border-wadi-border/50">
        <span className="text-[9px] text-wadi-muted/50 font-mono">
          ID: {project.id.slice(0, 8)}...
        </span>
        <span className="text-[9px] text-wadi-muted font-mono">
          {new Date(project.created_at).toLocaleDateString()}
        </span>
      </div>
    </Link>
  );
}
