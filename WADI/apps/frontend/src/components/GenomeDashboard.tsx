import React from 'react';
import { Activity, Layers, Cpu, ChevronRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
}

const StatCard = ({ label, value, icon: Icon }: StatCardProps) => (
  <div className="p-3 bg-wadi-gray-50 rounded-2xl border border-wadi-gray-100 mb-3 hover:border-wadi-gray-200 transition-colors">
    <div className="flex items-center gap-2 text-wadi-gray-400 mb-1">
      <Icon size={12} />
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </div>
    <div className="text-sm font-bold text-wadi-gray-900 font-wadi-mono">{value}</div>
  </div>
);

const GenomeDashboard: React.FC = () => {
  const nodes = ["Auth Schema", "Vector Index", "Prompt Forge"];

  return (
    <aside className="w-80 h-screen border-l border-wadi-gray-100 bg-white flex flex-col p-6 overflow-y-auto font-wadi-sans transition-all duration-300">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xs font-bold text-wadi-gray-900 flex items-center gap-2">
          <Activity size={14} className="text-wadi-accent-start" /> 
          <span className="tracking-widest uppercase">Project Genome</span>
        </h2>
        <span className="animate-pulse w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
      </div>

      <StatCard label="Memory Nodes" value="1,248" icon={Layers} />
      <StatCard label="AI Latency" value="240ms" icon={Cpu} />

      <div className="mt-8">
        <p className="text-[10px] font-bold text-wadi-gray-400 uppercase tracking-widest mb-4 px-1">Idea Graph Active Nodes</p>
        <div className="space-y-2">
          {nodes.map((node) => (
            <div key={node} className="flex items-center justify-between p-3 border border-wadi-gray-100 rounded-xl hover:bg-wadi-gray-50 hover:border-wadi-gray-200 transition-colors cursor-pointer group shadow-sm hover:shadow">
              <span className="text-xs font-medium text-wadi-gray-700">{node}</span>
              <ChevronRight size={14} className="text-wadi-gray-300 group-hover:text-wadi-accent-start transition-colors" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-6">
        <div className="p-4 bg-wadi-black rounded-2xl text-white shadow-xl">
          <p className="text-[10px] font-bold text-wadi-gray-400 uppercase mb-2 tracking-widest">Forge Engine Status</p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-wadi-accent-start animate-pulse" />
            <p className="text-xs font-wadi-mono text-wadi-gray-100">Evolving tools in background...</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default GenomeDashboard;
