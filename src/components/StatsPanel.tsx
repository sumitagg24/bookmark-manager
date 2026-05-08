import { BarChart3, TrendingUp, GitMerge, Database } from 'lucide-react';
import type { MergeResult } from '../types/bookmark';

interface StatsPanelProps {
  mergeResult: MergeResult | null;
}

function StatPill({
  value,
  label,
  icon: Icon,
  colorClass,
  bgClass,
}: {
  value: number;
  label: string;
  icon: typeof BarChart3;
  colorClass: string;
  bgClass: string;
}) {
  return (
    <div className={`flex flex-col rounded-2xl p-5 text-center border border-slate-100/50 dark:border-white/[0.06] ${bgClass}`}>
      <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${colorClass} bg-white/80 dark:bg-white/10 border border-slate-200/50 dark:border-white/[0.06]`}>
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div className="text-[28px] font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">
        {value}
      </div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
        {label}
      </div>
    </div>
  );
}

export function StatsPanel({ mergeResult }: StatsPanelProps) {
   if (!mergeResult || !mergeResult.stats) {
     return (
       <div className="premium-card p-8 text-center">
         <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-200/50 dark:border-blue-700/30">
           <BarChart3 className="h-8 w-8 text-blue-600" strokeWidth={1.5} />
         </div>
         <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No statistics yet</p>
         <p className="text-[14px] text-slate-500 dark:text-slate-500 max-w-sm mx-auto">
           Upload bookmark files to see merge statistics and insights about your collection.
         </p>
       </div>
     );
   }

   return (
     <div className="premium-card p-6 md:p-8">
       <h2 className="mb-6 text-xl font-bold tracking-tight text-slate-900 dark:text-white md:text-2xl">
         Statistics
       </h2>

       <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
         <StatPill 
           value={mergeResult.stats.totalInputBookmarks} 
           label="Total Input" 
           icon={Database}
           colorClass="text-blue-600 bg-blue-50 dark:bg-blue-900/20"
           bgClass="bg-blue-50/50 dark:bg-blue-950/10 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
         />
         <StatPill 
           value={mergeResult.stats.uniqueBookmarks} 
           label="Unique" 
           icon={GitMerge}
           colorClass="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
           bgClass="bg-emerald-50/50 dark:bg-emerald-950/10 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
         />
         <StatPill 
           value={mergeResult.stats.removedDuplicates} 
           label="Duplicates Removed" 
           icon={TrendingUp}
           colorClass="text-orange-600 bg-orange-50 dark:bg-orange-900/20"
           bgClass="bg-orange-50/50 dark:bg-orange-950/10 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
         />
         <StatPill 
           value={mergeResult.stats.similarBookmarksFound} 
           label="Similar Found" 
           icon={BarChart3}
           colorClass="text-purple-600 bg-purple-50 dark:bg-purple-900/20"
           bgClass="bg-purple-50/50 dark:bg-purple-950/10 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
         />
       </div>

       {mergeResult.sourceFiles.length > 0 && (
         <div className="mt-6 rounded-2xl border border-slate-100/50 bg-gradient-to-r from-slate-50 to-slate-50/50 px-5 py-4 dark:border-white/[0.06] dark:from-white/[0.03] dark:to-transparent">
           <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
             Sources
           </p>
           <p className="mt-1 text-[14px] font-medium text-slate-700 dark:text-slate-300">
             {mergeResult.sourceFiles.join(' · ')}
           </p>
         </div>
       )}
     </div>
   );
 }
