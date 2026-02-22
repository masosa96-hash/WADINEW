import { useState, useEffect } from "react";
import { API_URL } from "../config/api";
import { useAuthStore } from "../store/useAuthStore";
import { BarChart3, TrendingDown, ClipboardCheck, AlertCircle } from "lucide-react";

interface Snapshot {
  date: string;
  total_projects: number;
  crystallize_count: number;
  edit_count: number;
  avg_llm_duration_ms: number;
  structure_failed_count: number;
}

export default function AdminDashboard() {
  const { session, user } = useAuthStore();
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.access_token) return;

    const fetchSnapshots = async () => {
      try {
        const res = await fetch(`${API_URL}/api/system/snapshots`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 403) throw new Error("Acceso denegado: Se requiere rol de Admin");
          throw new Error("Error al cargar métricas");
        }

        const data = await res.json();
        setSnapshots(data);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Ocurrió un error inesperado");
      } finally {
        setLoading(false);
      }
    };

    fetchSnapshots();
  }, [session]);

  const scopes = (user?.user_metadata?.scopes as string[]) || [];
  const isAdmin = scopes.includes("admin:*");

  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-white p-6">
        <div className="text-center space-y-4">
          <AlertCircle className="mx-auto text-red-500" size={48} />
          <h1 className="text-2xl font-bold text-gray-900">Acceso No Autorizado</h1>
          <p className="text-gray-500">Esta zona es exclusiva para socios fundadores.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="p-8 text-center font-mono">Cargando métricas de WADI...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500 font-mono">{error}</div>;
  }

  const latest = snapshots[0] || { ttv_ms: 0, crystallize_count: 0, total_projects: 0 };
  const maxTtv = Math.max(...snapshots.map(s => s.avg_llm_duration_ms), 1);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-end border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Founder Dashboard</h1>
            <p className="text-gray-500 mt-1">Monitoreo de Salud y Velocidad de Valor</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Última Actualización</p>
            <p className="text-sm font-medium text-gray-700">{new Date().toLocaleDateString()}</p>
          </div>
        </header>

        {/* Totals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Total Proyectos (Hoy)" 
            value={latest.total_projects} 
            icon={<BarChart3 className="text-blue-500" size={20} />} 
          />
          <StatCard 
            title="Cristalizaciones" 
            value={latest.crystallize_count} 
            icon={<ClipboardCheck className="text-green-500" size={20} />} 
          />
          <StatCard 
            title="Avg TTV (ms)" 
            value={Math.round(latest.avg_llm_duration_ms)} 
            icon={<TrendingDown className="text-wadi-accent" size={20} />} 
            subtitle="Menos es mejor (velocidad)"
          />
        </div>

        {/* TTV Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wider">Historial de TTV (Efficiency Curve)</h3>
          <div className="flex items-end gap-2 h-48">
            {snapshots.slice().reverse().map((s, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group relative">
                <div 
                  className="w-full bg-blue-500/10 border-t-2 border-blue-500 rounded-t-sm transition-all hover:bg-blue-500/20"
                  style={{ height: `${(s.avg_llm_duration_ms / maxTtv) * 100}%` }}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10">
                    {Math.round(s.avg_llm_duration_ms)}ms
                  </div>
                </div>
                <p className="text-[8px] text-gray-400 mt-2 font-mono">{s.date.split('-').slice(1).join('/')}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-400 uppercase text-[10px] tracking-widest">Fecha</th>
                <th className="px-6 py-4 font-bold text-gray-400 uppercase text-[10px] tracking-widest">Proyectos</th>
                <th className="px-6 py-4 font-bold text-gray-400 uppercase text-[10px] tracking-widest">Cristalizaciones</th>
                <th className="px-6 py-4 font-bold text-gray-400 uppercase text-[10px] tracking-widest">TTV Promedio</th>
                <th className="px-6 py-4 font-bold text-gray-400 uppercase text-[10px] tracking-widest">Fallos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {snapshots.map((s, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-600">{s.date}</td>
                  <td className="px-6 py-4 font-medium">{s.total_projects}</td>
                  <td className="px-6 py-4 text-green-600 font-medium">+{s.crystallize_count}</td>
                  <td className="px-6 py-4 font-mono text-blue-600">{Math.round(s.avg_llm_duration_ms)}ms</td>
                  <td className="px-6 py-4 text-red-400">{s.structure_failed_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, subtitle }: { title: string; value: string | number; icon: React.ReactNode; subtitle?: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</span>
        {icon}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-black text-gray-900">{value}</span>
        {subtitle && <span className="text-[10px] text-gray-400 mb-1">{subtitle}</span>}
      </div>
    </div>
  );
}

