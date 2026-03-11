import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import GenomeDashboard from "./GenomeDashboard";

export default function Layout() {
  return (
    <div className="flex w-full h-screen font-wadi-sans overflow-hidden bg-white">
      {/* Columna Izquierda: Navegación */}
      <Sidebar />
      
      {/* Columna Central: Contenido Principal */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto relative scrollbar-thin scrollbar-thumb-wadi-gray-100 hover:scrollbar-thumb-wadi-gray-200">
          <div className="h-full flex flex-col">
             <Outlet />
          </div>
        </div>
      </main>

      {/* Columna Derecha: Información Técnica */}
      <GenomeDashboard />
    </div>
  );
}
