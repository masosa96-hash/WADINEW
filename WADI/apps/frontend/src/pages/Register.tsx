import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../config/supabase";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setLoading(false);
      setError(authError.message);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([{ user_id: data.user.id, display_name: displayName }]);

      if (profileError) {
        console.error("Profile creation failed:", profileError);
        setError("Account created but profile setup failed: " + profileError.message);
        setLoading(false);
        return;
      }

      setLoading(false);
      navigate("/projects");
    } else {
      setLoading(false);
      setError("Registration successful but no user returned. Check email confirmation settings.");
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
            New Identity Registration
          </p>
        </div>

        {error && (
          <div className="bg-wadi-error/10 border border-wadi-error text-wadi-error p-3 rounded mb-6 text-xs font-mono">
            ERROR: {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block mb-2 text-xs font-mono text-wadi-muted uppercase">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="wadi-input w-full"
              required
              autoFocus
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block mb-2 text-xs font-mono text-wadi-muted uppercase">
              Identity
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="wadi-input w-full"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block mb-2 text-xs font-mono text-wadi-muted uppercase">
              Access Key
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="wadi-input w-full"
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-sm"
          >
            {loading ? "CREATING ID..." : "REGISTER IDENTITY"}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-wadi-border/50 pt-4">
          <p className="text-[10px] text-wadi-muted font-mono">
            ALREADY REGISTERED?{" "}
            <Link to="/login" className="text-wadi-accent hover:underline">
              INITIATE SESSION
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
