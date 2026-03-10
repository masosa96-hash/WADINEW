import { useParams, Link } from "react-router-dom";
import { useProjectGenome, useProjectFeed, useEvolveProject } from "../hooks/useFounder";
import { Activity, GitBranch, Github, ExternalLink, RefreshCw, Zap, TrendingUp, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function ProjectGenomeDashboard() {
  const { id } = useParams();
  const { data: genomeData, isLoading: loadingGenome } = useProjectGenome(id!);
  const { data: feedData, isLoading: loadingFeed } = useProjectFeed(id!);
  const { mutate: evolveProject, isPending: isEvolving } = useEvolveProject(id!);

  if (loadingGenome) return <div className="p-12 text-center text-gray-500 animate-pulse">Cargando Genome del Proyecto...</div>;

  if (!genomeData?.name) return <div className="p-12 text-center text-red-500">Error: Proyecto no encontrado</div>;

  const { name, dna, score, business_model, repo_url, live_url } = genomeData;

  const getDnaName = () => dna || "Custom Build";
  const getMarketScore = () => score ? score.toFixed(1) : "N/A";
  
  return (
    <div className="max-w-6xl mx-auto py-8 text-wadi-text animate-in fade-in">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <Activity className="text-blue-600" size={28} />
            {name}
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            AI Founder Interface <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Live</span>
          </p>
        </div>
        
        <div className="flex gap-4">
          <Link to={`/projects/${id}/insights`} className="text-gray-600 font-medium hover:text-black border border-gray-200 bg-white px-4 py-2 rounded-lg flex items-center gap-2 transition-shadow hover:shadow-sm">
            <AlertTriangle size={16} /> Insights
          </Link>
          <button 
            onClick={() => evolveProject()} 
            disabled={isEvolving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50"
          >
            {isEvolving ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
            {isEvolving ? "Evolucionando..." : "Trigger Evolution"}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Genome & Metadata */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-5 py-4 flex items-center justify-between border-b">
               <h3 className="font-bold flex items-center gap-2">
                 <GitBranch size={16} className="text-gray-400" />
                 Project Genome
               </h3>
               <span className="text-xl font-black text-blue-600">{getMarketScore()}</span>
            </div>
            <div className="p-5 space-y-4 text-sm">
               <div>
                  <span className="text-gray-500 block text-xs uppercase font-bold tracking-wider mb-1">DNA Archetype</span>
                  <div className="font-semibold text-gray-900 bg-gray-100 inline-block px-3 py-1 rounded-md">{getDnaName()}</div>
               </div>
               {business_model && (
                 <>
                   <div>
                      <span className="text-gray-500 block text-xs uppercase font-bold tracking-wider mb-1">Business Model</span>
                      <div className="font-medium">{business_model}</div>
                   </div>
                 </>
               )}
            </div>
          </section>

          {/* Infrastructure */}
          <section className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
             <h3 className="font-bold flex items-center gap-2 mb-4">
                 <TrendingUp size={16} className="text-gray-400" />
                 Infrastructure
             </h3>
             <a href="#" target="_blank" className="flex items-center gap-3 p-3 border rounded-lg hover:border-gray-400 transition-colors group">
                 <div className="bg-gray-100 p-2 rounded-md group-hover:bg-black group-hover:text-white transition-colors">
                     <Github size={16} />
                 </div>
                 <div className="flex-1 overflow-hidden">
                     <p className="font-bold text-sm truncate">{repo_url}</p>
                     <p className="text-xs text-gray-500 flex items-center gap-1">Source Code <ExternalLink size={10} /></p>
                 </div>
             </a>

             <a href={live_url || "#"} target="_blank" className="flex items-center gap-3 p-3 border rounded-lg hover:border-blue-400 transition-colors group">
                 <div className="bg-blue-50 text-blue-600 p-2 rounded-md group-hover:bg-blue-600 group-hover:text-white transition-colors">
                     <Zap size={16} />
                 </div>
                 <div className="flex-1 overflow-hidden">
                     <p className="font-bold text-sm truncate text-blue-700">
                        {live_url ? live_url.replace("https://", "") : "Not deployed yet"}
                     </p>
                     <p className="text-xs text-blue-500 flex items-center gap-1">Status: {live_url ? "LIVE" : "PENDING"} <ExternalLink size={10} /></p>
                 </div>
             </a>
          </section>
        </div>

        {/* Right Column: Timeline / Evolution Feed */}
        <div className="lg:col-span-2">
            <section className="bg-white border rounded-xl shadow-sm h-full flex flex-col">
              <div className="px-6 py-5 border-b flex items-center justify-between">
                 <h2 className="text-xl font-bold">Evolution Feed</h2>
                 <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full animate-pulse">Listening to Metrics...</span>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
                {loadingFeed ? (
                   <div className="text-center text-gray-400 py-10 animate-pulse">Cargando timeline...</div>
                ) : feedData && feedData.length > 0 ? (
                   <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                      {feedData.map((event: { id: string, type: string, created_at: string, message: string, metadata?: { pr_url?: string } }) => (
                        <FeedItem key={event.id} event={event} />
                      ))}
                   </div>
                ) : (
                   <div className="text-center py-20 flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                         <Activity size={32} />
                      </div>
                      <h3 className="font-bold text-gray-700">No events yet</h3>
                      <p className="text-sm text-gray-500 max-w-sm mt-2">La startup acaba de nacer. Wadi está monitoreando interacciones para sugerir mejoras.</p>
                   </div>
                )}
              </div>
            </section>
        </div>
      </div>
    </div>
  );
}

// Subcomponent for timeline
function FeedItem({ event }: { event: { id: string, type: string, created_at: string, message: string, metadata?: { pr_url?: string } } }) {
   const isInsight = event.type === 'insight_detected';
   const isPR = event.type === 'pr_generated';
   const isDeploy = event.type === 'deploy_success';

   let Icon = Activity;
   let color = "bg-gray-100 text-gray-500";
   
   if (isInsight) {
      Icon = AlertTriangle;
      color = "bg-amber-100 text-amber-600";
   } else if (isPR) {
      Icon = GitBranch;
      color = "bg-purple-100 text-purple-600";
   } else if (isDeploy) {
      Icon = Zap;
      color = "bg-green-100 text-green-600";
   }

   return (
       <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
         {/* Icon */}
         <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-50 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${color} z-10`}>
             <Icon size={16} />
         </div>
         {/* Card */}
         <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border shadow-sm group-hover:shadow-md transition-all">
             <div className="flex items-center justify-between mb-1">
                 <span className={`text-xs font-bold uppercase tracking-wider ${color.split(' ')[1]}`}>
                     {event.type.replace('_', ' ')}
                 </span>
                 <time className="text-xs text-gray-400 font-medium">
                     {formatDistanceToNow(new Date(event.created_at), { addSuffix: true, locale: es })}
                 </time>
             </div>
             <p className="text-sm text-gray-800 font-medium mt-2">{event.message}</p>
             {event.metadata?.pr_url && (
                <a href={event.metadata.pr_url} target="_blank" className="text-xs text-blue-600 font-bold hover:underline mt-3 inline-block">
                    Review Pull Request →
                </a>
             )}
         </div>
       </div>
   );
}
