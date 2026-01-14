import { useState, useEffect } from 'react';
import { Lightbulb, Search, Trash2, BrainCircuit, Filter } from 'lucide-react';
import { supabase } from '../config/supabase';

// Interface matching the DB table
interface KnowledgeFact {
  id: string;
  content: string;
  category: string;
  confidence?: number; // DB might store this in content JSON or as column, assuming optional for now if not in schema properly
  created_at: string;
}

export default function Knowledge() {
  const [searchTerm, setSearchTerm] = useState('');
  const [facts, setFacts] = useState<KnowledgeFact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchKnowledge() {
        try {
            const { data } = await supabase
                .from("wadi_knowledge_base")
                .select("*")
                .order("created_at", { ascending: false });
            
            if (data) {
                // Map DB data to match UI expectations if needed
                // Assuming DB table 'wadi_knowledge_base' has id, content, category, created_at
                // and maybe 'confidence' if added, otherwise default it.
                const mapped = data.map(d => ({
                    ...d,
                    confidence: d.confidence || 0.85 // Default confidence if missing
                }));
                setFacts(mapped);
            }
        } catch (e) {
            console.error("Failed to load knowledge", e);
        } finally {
            setLoading(false);
        }
    }
    fetchKnowledge();
  }, []);

  const filteredFacts = facts.filter(f => 
    f.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full bg-white flex flex-col font-sans overflow-hidden">
      {/* Header de la Sección */}
      <header className="px-8 py-10 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <BrainCircuit size={24} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Knowledge Base</h1>
        </div>
        <p className="text-gray-500 max-w-2xl leading-relaxed">
          Aquí es donde WADI almacena lo que ha aprendido sobre vos, tus proyectos y tus preferencias a través de las reflexiones automáticas.
        </p>
      </header>

      {/* Barra de Búsqueda y Filtros */}
      <div className="px-8 mb-8 max-w-5xl mx-auto w-full">
        <div className="relative flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar en mi memoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all text-sm"
            />
          </div>
          <button className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-100 transition-all">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Rejilla de Hechos (Facts) */}
      <div className="flex-1 overflow-y-auto px-8 pb-10 scrollbar-thin scrollbar-thumb-gray-200">
        <div className="max-w-5xl mx-auto">
          {loading ? (
             <div className="text-center py-20 animate-pulse text-gray-400">Cargando memorias...</div>
          ) : filteredFacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFacts.map((fact) => (
                <div key={fact.id} className="group p-5 bg-white border border-gray-200 rounded-2xl hover:border-blue-200 hover:shadow-sm transition-all relative">
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2 py-1 bg-gray-100 text-[10px] font-bold text-gray-500 rounded uppercase tracking-wider">
                      {fact.category}
                    </span>
                    <button className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-4">
                    {fact.content}
                  </p>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <Lightbulb size={12} className="text-yellow-500" />
                      Confianza: {fact.confidence ? (fact.confidence * 100).toFixed(0) : '85'}%
                    </div>
                    <span className="text-[10px] text-gray-300">{new Date(fact.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Search size={24} className="text-gray-300" />
              </div>
              <h3 className="text-gray-900 font-medium">No se encontraron hechos</h3>
              <p className="text-gray-400 text-sm max-w-xs mt-1">
                WADI todavía no ha destilado conocimientos suficientes sobre este tema.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
