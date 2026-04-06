import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Library, Trash2, ArrowUpRight } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { StatsPanel } from './components/StatsPanel';
import { BookmarkTree } from './components/BookmarkTree';
import { ExportPanel } from './components/ExportPanel';
import { DuplicateReport } from './components/DuplicateReport';
import { DashboardNav } from './components/DashboardNav';
import { PremiumSidebar } from './components/PremiumSidebar';
import { ThemeToggle } from './components/ThemeToggle';
import { useBookmarkStore } from './store/bookmarkStore';

const scrollToSection = (id: string) => {
  const el = document.getElementById(`section-${id}`);
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

function App() {
  const { files, clearAll, error, mergeResult, sessionRestoredUi, dismissSessionNotice } =
    useBookmarkStore();
  const [activeNav, setActiveNav] = useState('upload');
  const hasFiles = files.length > 0;

  const onNav = useCallback((id: string) => {
    setActiveNav(id);
    scrollToSection(id);
  }, []);

  return (
    <div className="min-h-screen bg-premium-canvas dark:bg-[#0c1218]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-4 py-5 md:flex-row md:gap-6 md:px-6 md:py-7 lg:px-8 lg:py-8">
        <motion.aside
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="premium-card flex h-auto w-full flex-row items-center justify-center gap-2 px-3 py-3 md:w-[84px] md:flex-col md:justify-start md:px-2 md:py-8"
        >
          <div className="mb-0 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-premium-orange/15 to-transparent md:mb-6 md:h-12 md:w-12">
            <Library className="h-6 w-6 text-premium-orange" strokeWidth={1.75} aria-hidden />
          </div>
          <DashboardNav activeId={activeNav} onSelect={onNav} hasFiles={hasFiles} />
        </motion.aside>

        <motion.main
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="premium-card min-w-0 flex-1 p-6 md:p-8 lg:p-10"
        >
          {/* Title row + theme switch (top-right, all breakpoints) */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
            <div className="max-w-xl flex-1 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                Bookmark studio
              </p>
              <h1 className="text-3xl font-bold leading-[1.1] tracking-tight text-slate-900 dark:text-white md:text-4xl lg:text-[2.75rem]">
                Merge, dedupe, and export{' '}
                <span className="text-premium-orange">clean bookmarks</span>.
              </h1>
              <p className="text-[15px] leading-relaxed text-slate-500 dark:text-slate-400 md:text-base">
                Drop HTML or JSON exports from any browser. We merge folders, remove duplicate URLs,
                and let you edit before download.
              </p>
              <button
                type="button"
                onClick={() => onNav('upload')}
                className="btn-outline-premium mt-2 w-fit"
              >
                Get started
                <ArrowUpRight className="h-4 w-4" strokeWidth={2} aria-hidden />
              </button>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2 sm:pt-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                Appearance
              </p>
              <ThemeToggle />
            </div>
          </div>

          {sessionRestoredUi && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex flex-col gap-3 rounded-2xl border border-cyan-200/80 bg-cyan-50/90 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-cyan-900/40 dark:bg-cyan-950/25"
              role="status"
            >
              <p className="text-[13px] font-medium text-premium-navy dark:text-cyan-100">
                Your last session was restored from this browser (imports + merged preview).
              </p>
              <button
                type="button"
                onClick={dismissSessionNotice}
                className="btn-secondary shrink-0 py-2 text-[13px]"
              >
                Dismiss
              </button>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 rounded-2xl border border-red-200/80 bg-red-50 px-5 py-4 text-center text-[14px] font-medium text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200"
              role="alert"
            >
              {error}
            </motion.div>
          )}

          <div className="mt-10 space-y-8 md:mt-12 md:space-y-10">
            <section id="section-upload" className="scroll-mt-28 space-y-5">
              <FileUpload />
              {hasFiles && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  type="button"
                  onClick={clearAll}
                  className="btn-outline-premium w-full border-red-200/90 text-red-700 hover:border-red-300 hover:bg-red-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-950/20"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                  Clear all files
                </motion.button>
              )}
            </section>

            {hasFiles && (
              <>
                <section id="section-stats" className="scroll-mt-28">
                  <StatsPanel mergeResult={mergeResult} />
                </section>
                <DuplicateReport />
                <section id="section-preview" className="scroll-mt-28">
                  <BookmarkTree />
                </section>
                <section id="section-export" className="scroll-mt-28">
                  <ExportPanel />
                </section>
              </>
            )}

            {!hasFiles && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="premium-card border-dashed border-slate-200/80 bg-slate-50/50 px-8 py-16 text-center dark:border-white/10 dark:bg-white/[0.03]"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-premium-sm dark:bg-white/10">
                  <Library className="h-8 w-8 text-premium-orange" strokeWidth={1.5} aria-hidden />
                </div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">No files yet</p>
                <p className="mx-auto mt-2 max-w-sm text-[15px] text-slate-500 dark:text-slate-400">
                  Import bookmark exports above to see your merged library, stats, and export options.
                </p>
                <button
                  type="button"
                  onClick={() => onNav('upload')}
                  className="btn-primary mx-auto mt-6"
                >
                  Go to import
                </button>
              </motion.div>
            )}
          </div>

          <footer className="mt-12 border-t border-slate-100 pt-8 text-center text-[12px] text-slate-400 dark:border-white/10 dark:text-slate-500">
            <p>Processing stays in your browser — no uploads, no accounts.</p>
          </footer>
        </motion.main>

        <PremiumSidebar hasFiles={hasFiles} mergeResult={mergeResult} />
      </div>
    </div>
  );
}

export default App;
