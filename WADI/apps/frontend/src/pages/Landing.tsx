import { Link } from "react-router-dom";
import HeroSection from "../components/HeroSection";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-wadi-sans">
      <header className="py-6 px-10 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <h1 className="text-2xl font-black tracking-tight font-wadi-sans">wadi<span className="text-wadi-accent-start">.ai</span></h1>
        <div className="flex gap-4 items-center">
          <Link to="/login" className="text-sm font-semibold text-wadi-gray-500 hover:text-wadi-gray-900 transition-colors">Log in</Link>
          <Link to="/register" className="text-sm font-semibold bg-wadi-black text-white px-5 py-2.5 rounded-xl hover:bg-wadi-gray-900 transition-colors shadow-sm">
            Request Beta Access
          </Link>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        <HeroSection />
      </main>
    </div>
  );
}
