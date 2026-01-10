import { Link } from "react-router-dom";

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
}

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="block p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-blue-500 hover:shadow-lg transition group"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 truncate">
          {project.name}
        </h3>
        <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
          {project.status}
        </span>
      </div>
      <p className="text-gray-400 text-sm mb-4 line-clamp-2 h-10">
        {project.description || "No description provided."}
      </p>
      <div className="text-xs text-gray-500">
        Created: {new Date(project.created_at).toLocaleDateString()}
      </div>
    </Link>
  );
}
