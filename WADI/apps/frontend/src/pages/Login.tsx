import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../config/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      // Auth state update is handled by listener in authStore or App mount
      navigate("/projects");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-wadi-base text-wadi-text">
        
      <div className="w-full max-w-sm p-8 border border-wadi-border rounded bg-wadi-surface/50">
        <div className="mb-8 text-center">
             <h1 className="text-2xl font-mono font-bold tracking-tighter text-wadi-text mb-2">
                WADI<span className="text-wadi-accent">.SYS</span>
             </h1>
             <p className="text-xs font-mono text-wadi-muted uppercase tracking-widest">
                Technical Execution Assistant
             </p>
        </div>
        
        {error && (
          <div className="bg-wadi-error/10 border border-wadi-error text-wadi-error p-3 rounded mb-6 text-xs font-mono">
            ERROR: {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block mb-2 text-xs font-mono text-wadi-muted uppercase">Identity</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="wadi-input w-full"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block mb-2 text-xs font-mono text-wadi-muted uppercase">Access Key</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="wadi-input w-full"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-sm"
          >
            {loading ? "AUTHENTICATING..." : "INITIATE SESSION"}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-wadi-border/50 pt-4">
          <p className="text-[10px] text-wadi-muted font-mono">
            NO ACCOUNT?{" "}
            <Link to="/register" className="text-wadi-accent hover:underline">
              REGISTER NEW ID
            </Link>
          </p>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-[9px] font-mono text-wadi-muted/30 uppercase tracking-[0.2em]">
            System v5.0 // Deep Bunker Layout
        </p>
      </div>
    </div>
  );
}

