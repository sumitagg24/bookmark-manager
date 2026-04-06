import { useState, type FC } from 'react';
import { motion } from 'framer-motion';
import { Download, FileCheck, FileText, Table, ClipboardCopy } from 'lucide-react';
import { useBookmarkStore } from '../store/bookmarkStore';
import type { ExportFormat } from '../types/bookmark';

const FORMAT_OPTIONS: {
  value: ExportFormat;
  label: string;
  ext: string;
  icon: typeof FileCheck;
}[] = [
  { value: 'html', label: 'Netscape HTML', ext: '.html', icon: FileCheck },
  { value: 'urls', label: 'Plain URLs', ext: '.txt', icon: FileText },
  { value: 'csv', label: 'CSV', ext: '.csv', icon: Table },
];

export const ExportPanel: FC = () => {
  const { mergeResult, exportBookmarks, copyMarkdownToClipboard } = useBookmarkStore();
  const [filename, setFilename] = useState('merged_bookmarks');
  const [format, setFormat] = useState<ExportFormat>('html');
  const [exported, setExported] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);

  if (!mergeResult) return null;

  const selectedExt = FORMAT_OPTIONS.find((o) => o.value === format)?.ext ?? '.html';

  const handleExport = () => {
    exportBookmarks(filename, format);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const handleCopyMarkdown = async () => {
    const ok = await copyMarkdownToClipboard();
    if (ok) {
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="premium-card space-y-6 p-6 md:p-8"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/10 dark:from-emerald-500/20">
          <FileCheck className="h-7 w-7 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Export</h3>
          <p className="mt-0.5 text-[14px] text-slate-500 dark:text-slate-400">
            {mergeResult.stats.uniqueBookmarks} bookmarks ready to download
          </p>
        </div>
      </div>

      <div>
        <span className="mb-3 block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
          Format
        </span>
        <div className="flex flex-wrap gap-2.5">
          {FORMAT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = format === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFormat(opt.value)}
                className={`inline-flex items-center gap-2 rounded-2xl border-2 px-4 py-3 text-[13px] font-semibold transition-all duration-200 ${
                  active
                    ? 'border-premium-orange bg-premium-orange-soft text-premium-navy shadow-premium-sm dark:border-premium-orange dark:bg-premium-orange/15 dark:text-white'
                    : 'border-slate-200/90 bg-white text-slate-600 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/20'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                {opt.label}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">
          HTML for browsers; plain text and CSV for spreadsheets or scripts.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
          Filename
        </label>
        <div className="relative">
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="premium-input pr-20"
            placeholder="bookmarks"
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-medium text-slate-400">
            {selectedExt}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <button
          type="button"
          onClick={handleExport}
          className={
            exported
              ? 'inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-emerald-500 to-emerald-600 px-8 py-[1.125rem] text-base font-semibold text-white shadow-lg transition-all duration-300 hover:from-emerald-400 hover:to-emerald-500'
              : 'btn-primary flex-1 py-[1.125rem] text-base'
          }
        >
          {exported ? (
            <>
              <FileCheck className="h-5 w-5" strokeWidth={2} />
              Downloaded
            </>
          ) : (
            <>
              <Download className="h-5 w-5" strokeWidth={2} />
              Save &amp; download
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleCopyMarkdown}
          className={
            copiedMd
              ? 'inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-emerald-300 bg-emerald-50 px-5 py-[1.125rem] text-[14px] font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
              : 'btn-outline-premium flex-1 py-[1.125rem] text-[14px]'
          }
        >
          {copiedMd ? (
            <>
              <FileCheck className="h-5 w-5" strokeWidth={2} />
              Copied
            </>
          ) : (
            <>
              <ClipboardCopy className="h-5 w-5" strokeWidth={2} />
              Copy Markdown
            </>
          )}
        </button>
      </div>

      <p className="text-center text-[12px] text-slate-400 dark:text-slate-500">
        Works with Safari, Chrome, Firefox, Edge, and Brave.
      </p>
    </motion.div>
  );
};
