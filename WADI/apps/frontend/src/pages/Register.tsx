import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../config/supabase";
import Button from "../components/Button";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, ...props }) => (
  <div className="mb-5">
    <label className="block text-xs font-medium text-wadi-gray-500 mb-1.5 font-wadi-mono uppercase tracking-wider">
      {label}
    </label>
    <input 
      className="w-full px-4 py-3 bg-white border border-wadi-gray-300 rounded-xl text-wadi-gray-900 placeholder:text-wadi-gray-300 focus:ring-2 focus:ring-wadi-accent-end/30 focus:border-wadi-accent-end"
      {...props} 
    />
  </div>
);

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Verify Invite Code
    const { data: invite, error: inviteError } = await supabase
      .from("beta_invites")
      .select("*")
      .eq("code", inviteCode)
      .eq("used", false)
      .single();

    if (inviteError || !invite) {
      setLoading(false);
      setError("CÓDIGO DE INVITACIÓN INVÁLIDO O USADO.");
      return;
    }

    // 2. Auth SignUp
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
      // 3. Update Invite
      await supabase
        .from("beta_invites")
        .update({ used: true, used_by: data.user.id })
        .eq("code", inviteCode);

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
    <div className="min-h-screen bg-wadi-gray-50 flex items-center justify-center p-6 font-wadi-sans">
      <div className="bg-white p-10 rounded-3xl border border-wadi-gray-100 shadow-sm w-full max-w-lg">
        <div className="text-center mb-10">
          <h2 className="text-sm font-wadi-mono text-wadi-gray-500 uppercase tracking-widest flex items-center justify-center gap-2">
            wadi<span className="text-wadi-accent-start">.ai</span>
          </h2>
          <p className="text-3xl font-bold text-wadi-gray-900 mt-2">Create Identity</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-6 text-sm">
            ERROR: {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <InputField 
            label="Display Name" 
            placeholder="Your name or handle" 
            type="text" 
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            autoFocus
            autoComplete="username"
          />
          <InputField 
            label="Identity (Email)" 
            placeholder="you@domain.com" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <InputField 
            label="Access Key (Password)" 
            placeholder="••••••••" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <InputField 
            label="Beta Invite Code" 
            placeholder="WADI-BETA-XXXX" 
            type="text" 
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            required
          />
          
          <Button type="submit" variant="primary" className="w-full mt-6 py-3 text-base" disabled={loading}>
            {loading ? "Creating ID..." : "Register Identity"}
          </Button>
        </form>
        
        <div className="mt-10 pt-6 border-t border-wadi-gray-100 text-center text-sm text-wadi-gray-500">
          Already registered? <Link to="/login" className="font-semibold text-wadi-accent-end hover:underline">Initiate Session</Link>
        </div>
      </div>
    </div>
  );
}
