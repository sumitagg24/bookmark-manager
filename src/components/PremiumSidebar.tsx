import type { FC } from 'react';
import { Sparkles, Shield } from 'lucide-react';
import type { MergeResult } from '../types/bookmark';

type PremiumSidebarProps = {
  hasFiles: boolean;
  mergeResult: MergeResult | null;
};

export const PremiumSidebar: FC<PremiumSidebarProps> = ({ hasFiles, mergeResult }) => {
  const unique = mergeResult?.stats.uniqueBookmarks;
  const dupes = mergeResult?.stats.removedDuplicates ?? 0;

  return (
    <aside className="relative hidden w-[min(100%,320px)] shrink-0 flex-col gap-6 overflow-hidden rounded-[32px] bg-gradient-to-br from-[#9dd8ea] via-[#c5ecf5] to-[#dff4f8] p-8 shadow-[0_16px_48px_-16px_rgba(20,80,100,0.22)] dark:from-slate-800 dark:via-slate-800 dark:to-slate-950 dark:shadow-black/40 xl:flex">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/25 blur-2xl dark:bg-white/10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-8 left-8 h-32 w-32 rounded-full bg-cyan-300/30 blur-xl dark:bg-cyan-500/10"
        aria-hidden
      />

      <div className="relative">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-premium-navy/55 dark:text-slate-400">
          Overview
        </p>
        <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-premium-navy dark:text-slate-100">
          Your library
        </h2>
        <p className="mt-2 text-[11px] leading-relaxed text-premium-navy/55 dark:text-slate-400">
          Progress auto-saves in this browser until you clear all files.
        </p>
      </div>

      <div className="relative space-y-4">
        <div className="rounded-[22px] bg-premium-navy p-6 text-white shadow-xl shadow-premium-navy/25 dark:bg-[#0d1829] dark:shadow-black/40">
          <p className="text-[13px] font-medium text-white/65">Unique links</p>
          <p className="mt-1 text-5xl font-bold tabular-nums tracking-tight">
            {hasFiles && unique != null ? unique : '—'}
          </p>
          {hasFiles && dupes > 0 && (
            <p className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-[12px] font-medium text-white/85">
              {dupes} duplicate{dupes === 1 ? '' : 's'} merged out
            </p>
          )}
        </div>

        <div className="flex items-start gap-3 rounded-[20px] bg-white/50 p-4 backdrop-blur-sm dark:bg-white/5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-white/10">
            <Shield className="h-5 w-5 text-premium-navy dark:text-cyan-300" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-premium-navy dark:text-white">Private by design</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-premium-navy/65 dark:text-slate-400">
              Everything runs in your browser. Nothing leaves your device.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-[20px] bg-white/40 px-4 py-3 dark:bg-white/5">
          <Sparkles className="h-4 w-4 text-premium-orange" />
          <p className="text-[12px] font-medium text-premium-navy/75 dark:text-slate-300">
            Tip: Export as HTML to import into Safari or Chrome.
          </p>
        </div>
      </div>
    </aside>
  );
};
