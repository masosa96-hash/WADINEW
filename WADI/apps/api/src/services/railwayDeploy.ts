import axios from "axios";

export async function deployToRailway(repoUrl: string) {
  const token = process.env.RAILWAY_TOKEN;
  if (!token) throw new Error("RAILWAY_TOKEN is not defined");

  // Format: "https://github.com/owner/repo" -> "owner/repo"
  const match = repoUrl.match(/github\.com\/([^\/]+\/[^\/]+)/);
  if (!match) throw new Error("Invalid GitHub URL format");
  const repo = match[1].replace('.git', '');

  const res = await axios.post("https://backboard.railway.app/graphql/v2", {
    query: `
      mutation DeployRepo($repo: String!) {
        deployRepo(repo: $repo) {
          id
          url
        }
      }
    `,
    variables: { repo }
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });

  return res.data?.data?.deployRepo;
}
