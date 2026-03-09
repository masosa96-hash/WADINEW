import { useParams, Link } from "react-router-dom";
import { useProjectInsights } from "../hooks/useFounder";
import { AlertTriangle, CheckCircle, Zap, ArrowLeft } from "lucide-react";

export default function ProjectInsights() {
  const { id } = useParams();
  const { data: insights, isLoading } = useProjectInsights(id!);

  return (
    <div className="max-w-4xl mx-auto py-8 text-wadi-text animate-in slide-in-from-bottom-2 fade-in">
      <header className="mb-8 flex items-center gap-4">
        <Link to={`/projects/${id}`} className="text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-100 p-2">
           <ArrowLeft size={20} />
        </Link>
        <div>
           <h1 className="text-2xl font-bold flex items-center gap-2">
             <AlertTriangle className="text-amber-500" />
             Evolution Insights
           </h1>
           <p className="text-gray-500 text-sm mt-1">
             Oportunidades de mejora y reportes autogenerados por el AI Product Manager.
           </p>
        </div>
      </header>
      
      {isLoading ? (
        <div className="flex flex-col gap-4 animate-pulse pt-4">
            <div className="h-24 bg-gray-50 border rounded-xl" />
            <div className="h-24 bg-gray-50 border rounded-xl" />
        </div>
      ) : insights && insights.length > 0 ? (
        <div className="space-y-4">
            {insights.map((insight: { id: string, insight_type: string, severity: string, description: string, suggested_fix: string, status: string }) => (
                <InsightCard key={insight.id} insight={insight} />
            ))}
        </div>
      ) : (
         <div className="text-center p-12 border border-dashed rounded-xl bg-gray-50 mt-8">
             <CheckCircle size={40} className="mx-auto text-green-500 mb-4" />
             <h3 className="font-bold text-lg mb-1">Tu producto está saludable</h3>
             <p className="text-gray-500">No hay métricas de fricción detectadas por el momento.</p>
         </div>
      )}
    </div>
  );
}

function InsightCard({ insight }: { insight: { id: string, insight_type: string, severity: string, description: string, suggested_fix: string, status: string }}) {
   const isResolved = insight.status === 'resolved' || insight.status === 'pr_generated';
   
   return (
       <div className={`p-6 rounded-xl border flex gap-4 ${isResolved ? 'bg-gray-50 border-gray-200 opacity-70' : 'bg-white border-amber-200 shadow-sm'}`}>
          <div className="shrink-0">
             {isResolved ? <CheckCircle className="text-green-500" /> : <AlertTriangle className="text-amber-500" />}
          </div>
          <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-200 px-2 py-0.5 rounded-sm">
                          {insight.insight_type}
                      </span>
                      {!isResolved && (
                          <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full uppercase">
                              Severity: {insight.severity}
                          </span>
                      )}
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md capitalize ${isResolved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {insight.status.replace('_', ' ')}
                  </span>
              </div>
              
              <h3 className="text-lg font-bold mb-1">{insight.description}</h3>
              <p className="text-gray-600 font-medium text-sm mb-4">
                 <strong>Suggested Action:</strong> {insight.suggested_fix || "No action specified."}
              </p>
              
              {!isResolved && (
                  <div className="flex gap-3">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                          <Zap size={14} /> Generate Feature
                      </button>
                      <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                          Ignore
                      </button>
                  </div>
              )}
          </div>
       </div>
   );
}
