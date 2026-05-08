import { useState, type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Layers } from 'lucide-react';
import { useBookmarkStore } from '../store/bookmarkStore';
import { Favicon } from './Favicon';

export const DuplicateReport: FC = () => {
  const { mergeResult } = useBookmarkStore();
  const [openId, setOpenId] = useState<string | null>(null);

  if (!mergeResult) return null;

   const groups = mergeResult.duplicates.filter((g) => g.duplicates.length > 0);
   if (groups.length === 0) return null;

   return (
     <div className="premium-card p-6 md:p-8">
       <div className="mb-6 flex items-center gap-4">
         <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200/50 dark:border-amber-800/30 shadow-lg"
         >
           <Layers className="h-7 w-7 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
         </motion.div>
         <div>
           <h3 className="text-xl font-bold text-slate-900 dark:text-white">Duplicates removed</h3>
           <p className="mt-0.5 text-[14px] text-slate-500 dark:text-slate-400">
             {groups.length} URL{groups.length === 1 ? '' : 's'} had extra copies — one kept per link.
           </p>
         </div>
       </div>

       <ul className="max-h-[400px] space-y-3 overflow-y-auto pr-1.5">
         {groups.map((g, idx) => {
           const id = g.normalizedUrl;
           const isOpen = openId === id;
           return (
             <motion.li
               key={id}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.05 }}
               className="overflow-hidden rounded-2xl border border-slate-100/60 bg-white/60 dark:border-white/[0.06] dark:bg-white/[0.04] shadow-sm hover:shadow-md transition-shadow"
             >
               <button
                 type="button"
                 onClick={() => setOpenId(isOpen ? null : id)}
                 className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.06]"
               >
                 <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="text-slate-400">
                   <ChevronDown className="h-4 w-4" />
                 </motion.span>
                 <div className="flex min-w-0 flex-1 items-center gap-2.5">
                   <Favicon url={g.canonical.url} title={g.canonical.title} size="sm" />
                   <span className="truncate text-[14px] font-semibold text-slate-800 dark:text-slate-200">
                     {g.canonical.title}
                   </span>
                 </div>
                 <span className="shrink-0 rounded-full bg-gradient-to-r from-premium-orange/15 to-premium-orange/10 px-2.5 py-1 text-[11px] font-bold text-premium-orange border border-premium-orange/20">
                   +{g.duplicates.length}
                 </span>
               </button>
               <AnimatePresence initial={false}>
                 {isOpen && (
                   <motion.div
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: 'auto', opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                     className="overflow-hidden border-t border-slate-100/50 dark:border-white/[0.06] bg-slate-50/30 dark:bg-white/[0.02]"
                   >
                     <div className="space-y-5 p-5 text-[13px]">
                       <div>
                         <div className="mb-2 flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full bg-emerald-500" />
                           <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-600 dark:text-emerald-400">
                             Kept version
                           </p>
                         </div>
                         <div className="rounded-xl bg-white dark:bg-slate-800 p-3 border border-slate-200/50 dark:border-white/[0.06]">
                           <Favicon url={g.canonical.url} title={g.canonical.title} size="sm" />
                           <p className="mt-1.5 break-all font-medium text-slate-800 dark:text-slate-200">
                             {g.canonical.url}
                           </p>
                           <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">
                             {g.canonical.sourceFile}
                           </p>
                           {g.location && (
                             <p className="mt-1 text-[11px] text-premium-navy dark:text-cyan-400">
                               Folder: {g.location}
                             </p>
                           )}
                         </div>
                       </div>
                       <div>
                         <div className="mb-2 flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full bg-red-500" />
                           <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-red-600 dark:text-red-400">
                             Removed duplicates
                           </p>
                         </div>
                         <ul className="space-y-2">
                           {g.duplicates.map((d) => (
                             <motion.li
                               key={d.id}
                               initial={{ opacity: 0 }}
                               animate={{ opacity: 1 }}
                               className="rounded-xl border-l-3 border-red-400 bg-white/60 p-3 pl-3 dark:bg-black/20"
                             >
                               <div className="flex items-start gap-2.5">
                                 <Favicon url={d.url} title={d.title} size="sm" />
                                 <div className="min-w-0 flex-1">
                                   <p className="font-semibold text-slate-800 dark:text-slate-200">
                                     {d.title}
                                   </p>
                                   <p className="break-all text-[12px] text-slate-500">{d.url}</p>
                                   <div className="mt-1 flex items-center gap-2 text-[11px]">
                                     <span className="text-slate-400">{d.sourceFile}</span>
                                     {d.originalFolder && (
                                       <span className="text-premium-navy dark:text-cyan-400">• {d.originalFolder}</span>
                                     )}
                                   </div>
                                 </div>
                               </div>
                             </motion.li>
                           ))}
                         </ul>
                       </div>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
             </motion.li>
           );
         })}
       </ul>
     </div>
   );
 };
