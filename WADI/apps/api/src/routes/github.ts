import { Router, Request, Response } from "express";
import { supabase } from "../supabase";

const router = Router();

// Endpoint for the user to initiate the GitHub login explicitly
// Ideally, the frontend provides the user ID in the query param so we can map it back in the callback
router.get("/login", (req: Request, res: Response) => {
  const userId = req.query.state; // We use state to pipe the userId
  
  if (!userId) {
    return res.status(400).send("User ID state is strictly required to map the account.");
  }

  const redirect = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo&state=${userId}`;
  
  res.redirect(redirect);
});

// Callback once GitHub authorizes
router.get("/callback", async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const userId = req.query.state as string;

  if (!code || !userId) {
    return res.status(400).send("Missing code or user mapping state.");
  }

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });

    const data = await tokenRes.json() as { access_token: string };
    const accessToken = data.access_token;

    if (!accessToken) {
      return res.status(400).send("Failed to get GitHub access token.");
    }

    // Usando el admin supabase env o uno validado con token.
    // Lo guardamos en github_accounts enlazado al user_id
    await (supabase as any).from("github_accounts").upsert({
      user_id: userId,
      access_token: accessToken,
      // We could ideally fetch github username with the token utilizing Octokit, but we don't block the auth flow.
      created_at: new Date().toISOString()
    }, { onConflict: "user_id" });

    // Assuming the frontend app is served somewhere standard or we redirect to standard UI dashboard route
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/dashboard?github=connected`);

  } catch (err: any) {
    console.error("GitHub OAuth Error:", err);
    res.status(500).send("OAuth callback failed.");
  }
});

export default router;
