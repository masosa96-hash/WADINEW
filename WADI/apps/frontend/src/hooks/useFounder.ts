import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithRetry } from "../utils/api";
import { useAuthStore } from "../store/useAuthStore";

const MOCK_API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const getHeaders = (token: string | null) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {})
});

export const useProjectGenome = (projectId: string) => {
  const { session } = useAuthStore();
  return useQuery({
    queryKey: ["project_genome", projectId],
    queryFn: async () => {
      const res = await fetchWithRetry(`${MOCK_API_BASE}/projects/${projectId}/genome`, {
        headers: getHeaders(session?.access_token || null)
      });
      if (!res.ok) throw new Error("Failed to fetch project genome");
      return res.json();
    },
    enabled: !!projectId && !!session?.access_token,
  });
};

export const useProjectFeed = (projectId: string) => {
  const { session } = useAuthStore();
  return useQuery({
    queryKey: ["project_feed", projectId],
    queryFn: async () => {
      const res = await fetchWithRetry(`${MOCK_API_BASE}/projects/${projectId}/feed`, {
        headers: getHeaders(session?.access_token || null)
      });
      if (!res.ok) throw new Error("Failed to fetch project feed");
      return res.json();
    },
    enabled: !!projectId && !!session?.access_token,
    refetchInterval: 10000 // auto-refresh to see deploy updates or new PRs
  });
};

export const useProjectInsights = (projectId: string) => {
  const { session } = useAuthStore();
  return useQuery({
    queryKey: ["project_insights", projectId],
    queryFn: async () => {
      const res = await fetchWithRetry(`${MOCK_API_BASE}/projects/${projectId}/insights`, {
        headers: getHeaders(session?.access_token || null)
      });
      if (!res.ok) throw new Error("Failed to fetch project insights");
      return res.json();
    },
    enabled: !!projectId && !!session?.access_token,
  });
};

export const useProjectPRs = (projectId: string) => {
  const { session } = useAuthStore();
  return useQuery({
    queryKey: ["project_prs", projectId],
    queryFn: async () => {
      const res = await fetchWithRetry(`${MOCK_API_BASE}/projects/${projectId}/prs`, {
        headers: getHeaders(session?.access_token || null)
      });
      if (!res.ok) throw new Error("Failed to fetch project PRs");
      return res.json();
    },
    enabled: !!projectId && !!session?.access_token,
  });
};

export const useEvolveProject = (projectId: string) => {
  const queryClient = useQueryClient();
  const { session } = useAuthStore();
  
  return useMutation({
    mutationFn: async () => {
      const res = await fetchWithRetry(`${MOCK_API_BASE}/projects/${projectId}/evolve`, {
        method: "POST",
        headers: getHeaders(session?.access_token || null)
      });
      if (!res.ok) throw new Error("Failed to trigger evolution");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project_feed", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project_insights", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project_prs", projectId] });
    }
  });
};
