import axios from "axios";

// Creates or updates a Vercel project connected to a GitHub repo
export async function setupVercelProject(repoName: string, framework: string = "nextjs") {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error("VERCEL_TOKEN is not defined");

  // Vercel expects the full repo path: {owner}/{repoName}
  const githubOwner = process.env.GITHUB_OWNER || repoName.split("-")[0]; // Mock owner context
  const fullRepoPath = `${githubOwner}/${repoName}`;

  try {
    const res = await axios.post("https://api.vercel.com/v9/projects", {
      name: repoName,
      framework,
      gitRepository: {
        type: "github",
        repo: fullRepoPath
      }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return res.data;
  } catch (error: any) {
    if (error.response?.data?.error?.code === 'project_already_exists') {
      // Fetch existing
      const getRes = await axios.get(`https://api.vercel.com/v9/projects/${repoName}`, {
         headers: { Authorization: `Bearer ${token}` }
      });
      return getRes.data;
    }
    throw error;
  }
}

// Triggers an immediate deployment for the project
export async function deployToVercel(projectId: string) {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error("VERCEL_TOKEN is not defined");

  const res = await axios.post("https://api.vercel.com/v13/deployments", {
    name: projectId, // Project name or ID in Vercel
    target: "production"
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });

  return res.data;
}

// Get Deployment Status
export async function getVercelDeploymentStatus(deploymentId: string) {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error("VERCEL_TOKEN is not defined");

  const res = await axios.get(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  return res.data;
}
