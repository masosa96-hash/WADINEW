/**
 * External Tools Registry
 * Registro de integraciones y herramientas externas que el cerebro puede solicitar.
 */

export const toolRegistry = {
  analytics: {
    analyzeData: async (dataset) => {
      console.log(
        "[Tool] Analyzing data set with length:",
        dataset?.length || 0
      );
      return {
        summary: "Dummy analysis result",
        recommendedCharts: ["bar", "pie"],
      };
    },
  },
  marketing: {
    generateReport: async (params) => {
      console.log("[Tool] Generating marketing report for:", params);
      return {
        reportId: "mock-123",
        status: "draft",
        url: "/reports/mock-123",
      };
    },
    simulateScenario: async (scenario) => {
      console.log("[Tool] Simulating scenario:", scenario);
      return { outcome: "positive", confidence: 0.85 };
    },
    manageCampaign: async (action, campaignId) => {
      console.log(`[Tool] Managing campaign ${campaignId}: ${action}`);
      return { success: true, newStatus: "active" };
    },
  },
  projects: {
    manageProject: async (action, projectId) => {
      console.log(`[Tool] Managing project ${projectId}: ${action}`);
      return { success: true, tasksUpdated: 0 };
    },
  },
  database: {
    connect: async (connectionString) => {
      console.log("[Tool] Testing connection to DB...");
      return { connected: true, latencyMs: 45 };
    },
  },
};

export const availableToolsDescription = () => {
  return Object.keys(toolRegistry)
    .map((category) => {
      return `${category}: ${Object.keys(toolRegistry[category]).join(", ")}`;
    })
    .join("\n");
};
