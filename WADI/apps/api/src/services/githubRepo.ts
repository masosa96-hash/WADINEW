import { Octokit } from "@octokit/rest";

export async function createRepo(token: string, name: string) {
  const octokit = new Octokit({
    auth: token
  });

  const repo = await octokit.repos.createForAuthenticatedUser({
    name,
    private: true
  });

  return repo.data;
}

export async function getGithubUser(token: string) {
  const octokit = new Octokit({
    auth: token
  });
  
  const user = await octokit.users.getAuthenticated();
  return user.data;
}
