import { useState, type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Layers } from 'lucide-react';
import { useBookmarkStore } from '../store/bookmarkStore';

export const DuplicateReport: FC = () => {
  const { mergeResult } = useBookmarkStore();
  const [openId, setOpenId] = useState<string | null>(null);

  if (!mergeResult) return null;

  const groups = mergeResult.duplicates.filter((g) => g.duplicates.length > 0);
  if (groups.length === 0) return null;

  return (
    <div className="premium-card p-6 md:p-8">
      <div className="mb-5 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100/90 dark:bg-amber-950/40">
          <Layers className="h-7 w-7 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Duplicates removed</h3>
          <p className="mt-0.5 text-[14px] text-slate-500 dark:text-slate-400">
            {groups.length} URL{groups.length === 1 ? '' : 's'} had extra copies — one kept per link.
          </p>
        </div>
      </div>

      <ul className="max-h-[340px] space-y-2.5 overflow-y-auto pr-1">
        {groups.map((g) => {
          const id = g.normalizedUrl;
          const isOpen = openId === id;
          return (
            <li
              key={id}
              className="overflow-hidden rounded-[22px] border border-slate-100 bg-slate-50/60 dark:border-white/[0.06] dark:bg-white/[0.04]"
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : id)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/80 dark:hover:bg-white/[0.06]"
              >
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="text-slate-400">
                  <ChevronDown className="h-4 w-4" />
                </motion.span>
                <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-slate-800 dark:text-slate-200">
                  {g.canonical.title}
                </span>
                <span className="shrink-0 rounded-full bg-premium-orange/15 px-2.5 py-1 text-[11px] font-bold text-premium-orange dark:bg-premium-orange/25">
                  +{g.duplicates.length}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-slate-100 dark:border-white/[0.06]"
                  >
                    <div className="space-y-4 p-5 text-[13px]">
                      <div>
                        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                          Kept
                        </p>
                        <p className="break-all font-medium text-slate-800 dark:text-slate-200">
                          {g.canonical.url}
                        </p>
                        <p className="mt-1 text-[12px] text-slate-500">{g.canonical.sourceFile}</p>
                      </div>
                      <div>
                        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                          Removed
                        </p>
                        <ul className="space-y-2">
                          {g.duplicates.map((d) => (
                            <li
                              key={d.id}
                              className="rounded-xl border-l-4 border-premium-orange bg-white/60 py-2 pl-3 dark:bg-black/20"
                            >
                              <p className="font-semibold text-slate-800 dark:text-slate-200">
                                {d.title}
                              </p>
                              <p className="break-all text-[12px] text-slate-500">{d.url}</p>
                              <p className="text-[11px] text-slate-400">{d.sourceFile}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
