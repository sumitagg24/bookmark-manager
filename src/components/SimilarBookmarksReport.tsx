import { useState, type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, AlertCircle, Check, X, Radio, Trash2 } from 'lucide-react';
import { useBookmarkStore } from '../store/bookmarkStore';

export const SimilarBookmarksReport: FC = () => {
  const { mergeResult, acceptSimilarBookmarks, discardSimilarBookmarks, discardBothSimilarBookmarks, selectBookmarkToKeep } = useBookmarkStore();
  const [openId, setOpenId] = useState<string | null>(null);

  if (!mergeResult || mergeResult.similarBookmarks.length === 0) return null;

  const groups = mergeResult.similarBookmarks;

  return (
    <div className="premium-card p-6 md:p-8">
      <div className="mb-5 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100/90 dark:bg-cyan-950/40">
          <AlertCircle className="h-7 w-7 text-cyan-600 dark:text-cyan-400" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Similar bookmarks detected</h3>
          <p className="mt-0.5 text-[14px] text-slate-500 dark:text-slate-400">
            {groups.length} bookmark{groups.length === 1 ? '' : 's'} with same domain but different URLs — select which to keep.
          </p>
        </div>
      </div>

      <ul className="max-h-[600px] space-y-2.5 overflow-y-auto pr-1">
        {groups.map((g, idx) => {
          const id = g.canonical.id;
          const isOpen = openId === id;
          const isPending = g.status === 'pending' || !g.status;
          const isAccepted = g.status === 'accepted';
          const isDiscarded = g.status === 'discarded';
          const selectedToKeep = g.selectedToKeep || g.canonical.id;
          
          return (
            <li
              key={id}
              className={`overflow-hidden rounded-[22px] border transition-all ${
                isAccepted
                  ? 'border-emerald-200/50 bg-emerald-50/40 dark:border-emerald-900/30 dark:bg-emerald-950/20'
                  : isDiscarded
                  ? 'border-slate-200/50 bg-slate-50/40 dark:border-white/[0.04] dark:bg-white/[0.02] opacity-60'
                  : 'border-slate-100 bg-slate-50/60 dark:border-white/[0.06] dark:bg-white/[0.04]'
              }`}
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
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full bg-cyan-100/80 px-2.5 py-1 text-[11px] font-bold text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300">
                    +{g.similar.length}
                  </span>
                  {isAccepted && (
                    <span className="rounded-full bg-emerald-100/80 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      Accepted
                    </span>
                  )}
                  {isDiscarded && (
                    <span className="rounded-full bg-slate-200/80 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                      Discarded
                    </span>
                  )}
                </div>
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
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                          Select which bookmark to keep (others will be removed)
                        </p>
                        
                        {/* Primary bookmark option */}
                        <div
                          onClick={() => selectBookmarkToKeep(idx, g.canonical.id)}
                          className={`mb-3 cursor-pointer rounded-xl border-2 p-3 transition-all ${
                            selectedToKeep === g.canonical.id
                              ? 'border-emerald-400 bg-emerald-50/60 dark:border-emerald-500 dark:bg-emerald-950/30'
                              : 'border-slate-200 bg-white/60 hover:border-slate-300 dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:border-white/[0.12]'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1 shrink-0">
                              <Radio
                                className={`h-4 w-4 ${
                                  selectedToKeep === g.canonical.id
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-slate-400'
                                }`}
                                fill={selectedToKeep === g.canonical.id ? 'currentColor' : 'none'}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-800 dark:text-slate-200">
                                {g.canonical.title}
                              </p>
                              <p className="break-all text-[12px] text-slate-500 mt-1">{g.canonical.url}</p>
                              <p className="text-[11px] text-slate-400">{g.canonical.sourceFile}</p>
                            </div>
                          </div>
                        </div>

                        {/* Similar bookmarks options */}
                        {g.similar.length > 0 && (
                          <div className="space-y-2">
                            {g.similar.map((s) => (
                              <div
                                key={s.id}
                                onClick={() => selectBookmarkToKeep(idx, s.id)}
                                className={`cursor-pointer rounded-xl border-2 p-3 transition-all ${
                                  selectedToKeep === s.id
                                    ? 'border-emerald-400 bg-emerald-50/60 dark:border-emerald-500 dark:bg-emerald-950/30'
                                    : 'border-slate-200 bg-white/60 hover:border-slate-300 dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:border-white/[0.12]'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="mt-1 shrink-0">
                                    <Radio
                                      className={`h-4 w-4 ${
                                        selectedToKeep === s.id
                                          ? 'text-emerald-600 dark:text-emerald-400'
                                          : 'text-slate-400'
                                      }`}
                                      fill={selectedToKeep === s.id ? 'currentColor' : 'none'}
                                    />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                                      {s.title}
                                    </p>
                                    <p className="break-all text-[12px] text-slate-500 mt-1">{s.url}</p>
                                    <p className="text-[11px] text-slate-400">{s.sourceFile}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {isPending && (
                        <div className="flex gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              acceptSimilarBookmarks(idx);
                              setOpenId(null);
                            }}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-100/80 py-2.5 text-[13px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-950/80"
                          >
                            <Check className="h-4 w-4" />
                            Apply Selection
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              discardSimilarBookmarks(idx);
                              setOpenId(null);
                            }}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/60 py-2.5 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/[0.06] dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08]"
                          >
                            <X className="h-4 w-4" />
                            Keep All
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              discardBothSimilarBookmarks(idx);
                              setOpenId(null);
                            }}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/60 py-2.5 text-[13px] font-semibold text-red-700 transition-colors hover:bg-red-100/80 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40"
                          >
                            <Trash2 className="h-4 w-4" />
                            Discard Both
                          </button>
                        </div>
                      )}
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
