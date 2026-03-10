import { Link } from "react-router-dom";
import { Zap, Activity, GitBranch } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <header className="py-6 px-10 border-b border-gray-100 flex justify-between items-center">
        <h1 className="text-2xl font-black tracking-tight">wadi.ai</h1>
        <div className="flex gap-4">
          <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-black mt-2">Log in</Link>
          <Link to="/register" className="text-sm font-bold bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">
            Request Beta Access
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="max-w-3xl space-y-8 animate-in slide-in-from-bottom-8 fade-in duration-500">
          <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full border border-yellow-200 uppercase tracking-widest">
            Autonomous Venture Studio
          </span>
          <h1 className="text-6xl md:text-8xl font-black leading-tight tracking-tighter">
            Turn ideas into <br/>
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">evolving startups</span>.
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 font-medium max-w-2xl mx-auto">
             Stop writing boilerplate. Wadi generates your startup, deploys the code, monitors metrics, and codes revenue-generating features automatically.
          </p>
          
          <div className="pt-8">
             <Link to="/register" className="text-lg bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-transform hover:scale-105 inline-flex items-center gap-3 shadow-xl">
                Get Started
                <Zap size={20} />
             </Link>
          </div>
          
          <div className="mt-20 border-t border-gray-100 pt-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
             <div>
                <Activity className="text-blue-600 mb-4" size={32} />
                <h3 className="text-xl font-bold mb-2">Metrics Driven</h3>
                <p className="text-gray-500 font-medium">Wadi analyzes user behavior constantly to detect friction and conversion drop-offs.</p>
             </div>
             <div>
                <GitBranch className="text-purple-600 mb-4" size={32} />
                <h3 className="text-xl font-bold mb-2">Automated Pull Requests</h3>
                <p className="text-gray-500 font-medium">When it finds a problem, the AI Engineer writes a feature and submits a PR to your repo.</p>
             </div>
             <div>
                <Zap className="text-yellow-500 mb-4" size={32} />
                <h3 className="text-xl font-bold mb-2">Continuous Evolution</h3>
                <p className="text-gray-500 font-medium">The system works 24/7. Wake up to overnight improvements to your startup automatically.</p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
