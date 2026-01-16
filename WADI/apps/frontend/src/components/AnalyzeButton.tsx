import React from "react";
import { useAIStore } from "../store/aiStore";
import { useAuthStore } from "../store/useAuthStore";
import { API_URL, getHeaders } from "../config/api";

interface AnalyzeButtonProps {
  projectId: string;
}

export const AnalyzeButton: React.FC<AnalyzeButtonProps> = ({ projectId }) => {
  const { isProcessing, startAnalysis, pollJob, setError } = useAIStore();
  const token = useAuthStore((state) => state.session?.access_token);

  const handleAction = async () => {
    if (!token) {
        setError("No authenticated session");
        return;
    }

    startAnalysis();
    try {
      const res = await fetch(`${API_URL}/v2/projects/${projectId}/analyze`, {
        method: "POST",
        headers: getHeaders(token),
      });

      if (!res.ok) {
        throw new Error("Failed to start analysis");
      }

      const data = await res.json();
      // Backend returns { message: "AI Analysis started", jobId: "..." }
      pollJob(data.jobId);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  return (
    <button
      onClick={handleAction}
      disabled={isProcessing}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        isProcessing
          ? "bg-slate-300 text-slate-500 cursor-not-allowed"
          : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
      }`}
    >
      {isProcessing ? "Analizando..." : "Preguntar a WADI"}
    </button>
  );
};
