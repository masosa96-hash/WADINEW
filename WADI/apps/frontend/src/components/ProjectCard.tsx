import { Link } from "react-router-dom";
// import { ProjectDTO, ProjectStatus } from "@wadi/core"; // Ideally use DTOs
// Using local interface for now to match file state, but cleaning visuals.

// Mapping statuses to Badge colors
const STATUS_STYLES: Record<string, string> = {
  PLANNING: "bg-slate-100 text-slate-600 border-slate-200",
  IN_PROGRESS: "bg-blue-50 text-blue-600 border-blue-200",
  BLOCKED: "bg-red-50 text-red-600 border-red-200",
  COMPLETED: "bg-emerald-50 text-emerald-600 border-emerald-200",
  ARCHIVED: "bg-slate-50 text-slate-400 border-slate-100",
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
      className="group block bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
          {project.name}
        </h3>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusStyle}`}>
          {project.status || 'PLANNING'}
        </span>
      </div>
      
      <p className="text-slate-500 text-xs mb-4 line-clamp-2 h-8 leading-relaxed">
        {project.description || "Sin descripción."}
      </p>
      
      <div className="flex justify-between items-center pt-3 border-t border-slate-50">
        <span className="text-[10px] text-slate-400 font-medium">
          {new Date(project.created_at).toLocaleDateString()}
        </span>
        {/* User avatar or tiny meta could go here */}
      </div>
    </Link>
  );
}
