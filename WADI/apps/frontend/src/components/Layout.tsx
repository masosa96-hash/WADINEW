import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="flex w-full h-screen bg-wadi-base overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Minimal TopBar - Context Aware */}
        <header className="h-12 border-b border-wadi-border bg-wadi-base/95 backdrop-blur flex items-center justify-between px-6 shrink-0 z-40">
            <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 text-xs font-mono text-wadi-muted">
                    <span className="w-2 h-2 rounded-full bg-wadi-accent animate-pulse"></span>
                    <span>SYSTEM_READY</span>
                 </div>
                 <div className="h-4 w-px bg-wadi-border"></div>
                 {/* Breadcrumbs or Context placeholders could go here */}
                 <div className="text-xs font-mono text-wadi-text/50">
                    CONTEXT: <span className="text-wadi-text">GLOBAL</span>
                 </div>
            </div>
            
            <div className="text-[10px] font-mono text-wadi-muted/30 uppercase tracking-widest">
                WADI v5.0.0-BETA
            </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-wadi-base relative scrollbar-thin scrollbar-track-wadi-base scrollbar-thumb-wadi-border">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
