import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="flex w-full h-screen bg-wadi-base text-wadi-text overflow-hidden font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative bg-transparent">
        {/* Invisible Context Header - Only shows essential status if busy */}
        <div className="absolute top-4 right-6 z-50 flex items-center pointer-events-none">
             {/* We can use this area for very subtle status indicators if needed, or leave empty for Zen */}
             <div className="flex items-center gap-2 opacity-50">
                 {/* Placeholder for small busy indicator if needed later */}
             </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto relative scrollbar-thin scrollbar-thumb-black/5 hover:scrollbar-thumb-black/10">
          <div className="max-w-3xl mx-auto h-full px-6 flex flex-col">
             <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
