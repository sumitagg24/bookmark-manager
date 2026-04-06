import type { MergeResult } from '../types/bookmark';

interface StatsPanelProps {
  mergeResult: MergeResult | null;
}

function StatPill({
  value,
  label,
  variant,
}: {
  value: number;
  label: string;
  variant: 'light' | 'navy';
}) {
  const isNavy = variant === 'navy';
  return (
    <div
      className={`flex flex-col justify-center rounded-[22px] px-4 py-5 text-center md:px-5 md:py-6 ${
        isNavy
          ? 'bg-premium-navy text-white shadow-lg shadow-premium-navy/20 dark:bg-[#0d1829]'
          : 'border border-slate-100 bg-slate-50/90 dark:border-white/[0.06] dark:bg-white/[0.05]'
      }`}
    >
      <div
        className={`text-[28px] font-bold tabular-nums tracking-tight md:text-[32px] ${
          isNavy ? 'text-white' : 'text-slate-900 dark:text-white'
        }`}
      >
        {value}
      </div>
      <div
        className={`mt-1.5 text-[10px] font-bold uppercase tracking-[0.12em] ${
          isNavy ? 'text-white/60' : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        {label}
      </div>
    </div>
  );
}

export function StatsPanel({ mergeResult }: StatsPanelProps) {
  if (!mergeResult) {
    return (
      <div className="premium-card p-8 text-center text-[14px] text-slate-500 dark:text-slate-400">
        Upload files to see merge statistics.
      </div>
    );
  }

  return (
    <div className="premium-card p-6 md:p-8">
      <h2 className="mb-6 text-xl font-bold tracking-tight text-slate-900 dark:text-white md:text-2xl">
        Statistics
      </h2>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatPill value={mergeResult.stats.totalInputBookmarks} label="Total input" variant="light" />
        <StatPill value={mergeResult.stats.uniqueBookmarks} label="Unique" variant="navy" />
        <StatPill value={mergeResult.stats.removedDuplicates} label="Duplicates" variant="light" />
        <StatPill value={mergeResult.stats.mergedFolders} label="Folders merged" variant="light" />
      </div>

      {mergeResult.sourceFiles.length > 0 && (
        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-4 dark:border-white/[0.06] dark:bg-white/[0.03]">
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
