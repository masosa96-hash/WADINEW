import { useEffect, useState } from "react";
import { supabase } from "../config/supabase";
import { Brain } from "lucide-react";

interface Fact {
  id: string;
  category: string;
  content: string;
  created_at: string;
}

export default function Knowledge() {
  const [facts, setFacts] = useState<Fact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchKnowledge() {
        try {
            const { data } = await supabase
                .from("wadi_knowledge_base")
                .select("*")
                .order("created_at", { ascending: false });
            
            if (data) setFacts(data);
        } catch (e) {
            console.error("Failed to load knowledge", e);
        } finally {
            setLoading(false);
        }
    }
    fetchKnowledge();
  }, []);

  if (loading) {
      return <div className="p-8 text-center text-wadi-muted animate-pulse">Consultando memoria...</div>;
  }

  const groupedFacts = facts.reduce((acc, fact) => {
      if (!acc[fact.category]) acc[fact.category] = [];
      acc[fact.category].push(fact);
      return acc;
  }, {} as Record<string, Fact[]>);

  return (
    <div className="max-w-3xl mx-auto py-8">
        <header className="mb-8">
            <h1 className="text-2xl font-bold text-wadi-text flex items-center gap-2">
                <Brain className="w-6 h-6 text-wadi-muted" />
                Memoria a Largo Plazo
            </h1>
            <p className="text-wadi-muted mt-2">
                Lo que WADI ha aprendido sobre vos y tus proyectos.
            </p>
        </header>

        {facts.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💤</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">WADI todavía no conoce detalles sobre vos</h3>
                <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                    Empezá a charlar sobre tus preferencias o proyectos para que el sistema empiece a aprender y guardar datos útiles.
                </p>
            </div>
        ) : (
            <div className="space-y-8">
                {Object.entries(groupedFacts).map(([category, items]) => (
                    <section key={category}>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-wadi-muted mb-4 border-b border-gray-100 pb-2">
                            {category}
                        </h2>
                        <div className="grid gap-3">
                            {items.map(fact => (
                                <div key={fact.id} className="bg-white border border-gray-100 p-4 rounded-xl hover:border-gray-200 transition-colors shadow-sm">
                                    <p className="text-gray-800">{fact.content}</p>
                                    <span className="text-[10px] text-gray-400 mt-2 block">
                                        {new Date(fact.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        )}
    </div>
  );
}
