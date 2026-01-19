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

interface ProjectCardProps {
  project: Project;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggle?: (id: string) => void;
}

export default function ProjectCard({ project, isSelectionMode, isSelected, onToggle }: ProjectCardProps) {
  const statusStyle = STATUS_STYLES[project.status] || STATUS_STYLES.PLANNING;

  const CardContent = (
    <>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-wadi-text group-hover:text-wadi-accent transition-colors truncate pr-2">
          {project.name || 'GENERAL'}
        </h3>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide ${statusStyle}`}>
          {project.status === 'IN_PROGRESS' ? 'Active' : project.status ? project.status.charAt(0) + project.status.slice(1).toLowerCase() : 'Plan'}
        </span>
      </div>
      
      <p className="text-wadi-muted text-xs mb-4 line-clamp-2 leading-relaxed">
        {project.description || "Default Operational Context"}
      </p>
      
      <div className="flex justify-between items-center pt-2 border-t border-gray-50">
        <span className="text-[10px] text-wadi-muted/40 font-mono">
          #{project.id.slice(0, 4)}
        </span>
        <span className="text-[10px] text-wadi-muted/60">
          {new Date(project.created_at).toLocaleDateString()}
        </span>
      </div>
    </>
  );

  return (
    <div 
      onClick={() => isSelectionMode && onToggle?.(project.id)}
      className={`group block bg-white rounded-lg shadow-sm border transition-all duration-200 relative ${
        isSelected 
        ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/50' 
        : 'border-transparent hover:shadow-md'
      } ${!isSelectionMode ? 'cursor-pointer' : ''}`}
    >
      {isSelectionMode && (
        <div className="absolute top-2 right-2 z-10">
          <input 
            type="checkbox" 
            checked={isSelected}
            onChange={() => onToggle?.(project.id)}
            className="w-5 h-5 accent-blue-500 cursor-pointer"
          />
        </div>
      )}

      {isSelectionMode ? (
         <div className="p-4 opacity-80 pointer-events-none">
           {CardContent}
         </div>
      ) : (
         <div className="p-0">
            <Link
              to={`/projects/${project.id}`}
              className="block p-4 w-full h-full"
            >
              {CardContent}
            </Link>
         </div>
      )}
    </div>
  );
}
