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

    // 1. Sign Up
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
      // 2. Create Profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            user_id: data.user.id,
            display_name: displayName,
          },
        ]); // RLS allows insert own id usually, or use trigger. Plan assumes direct insert?
        // Wait, default Supabase behavior often requires a Trigger for profiles creation to be safe.
        // Or if RLS allows insert with auth.uid() = user_id, it is fine.
        // Let's assume we handle it here. If it fails due to RLS or trigger, we might need a trigger.
        // For Beta 1, let's try direct insert.

      if (profileError) {
        console.error("Profile creation failed:", profileError);
        // Continue anyway? Or show error.
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
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">WADI Register</h2>
        
        {error && (
          <div className="bg-red-500 text-white p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
            <div>
            <label className="block mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-green-600 hover:bg-green-700 rounded transition disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

