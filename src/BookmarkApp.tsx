import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Library, Trash2, Menu, X, Upload, Star, BarChart3, Eye,
  Tags, Download, LayoutDashboard
} from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { StatsPanel } from './components/StatsPanel';
import { BookmarkTree } from './components/BookmarkTree';
import { ExportPanel } from './components/ExportPanel';
import { DuplicateReport } from './components/DuplicateReport';
import { SimilarBookmarksReport } from './components/SimilarBookmarksReport';
import { AdvancedFeaturesPanel } from './components/AdvancedFeaturesPanel';
import { ThemeToggle } from './components/ThemeToggle';
import { TagsPanel } from './components/TagsPanel';
import { SearchHistoryPanel } from './components/SearchHistoryPanel';
import { FavoritesPanel } from './components/FavoritesPanel';
import { BackupRestorePanel } from './components/BackupRestorePanel';
import { OnboardingGuide } from './components/OnboardingGuide';
import { useBookmarkStore } from './store/bookmarkStore';

const scrollToSection = (id: string) => {
  const el = document.getElementById(`section-${id}`);
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const navItems = [
  { id: 'upload', label: 'Import', icon: Upload, desc: 'Upload bookmark files' },
  { id: 'favorites', label: 'Favorites', icon: Star, desc: 'Starred bookmarks', requiresFiles: true },
  { id: 'stats', label: 'Stats', icon: BarChart3, desc: 'Library insights', requiresFiles: true },
  { id: 'preview', label: 'Preview', icon: Eye, desc: 'Browse & edit tree', requiresFiles: true },
  { id: 'tags', label: 'Tags', icon: Tags, desc: 'Organize with tags', requiresFiles: true },
  { id: 'export', label: 'Export', icon: Download, desc: 'Download results', requiresFiles: true },
];

function App() {
  const { files, clearAll, error, mergeResult, sessionRestoredUi } =
    useBookmarkStore();
  const [activeNav, setActiveNav] = useState('upload');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hasFiles = files.length > 0;

  const onNav = useCallback((id: string) => {
    setActiveNav(id);
    setMobileMenuOpen(false);
    scrollToSection(id);
  }, []);

  return (
    <div className="min-h-screen bg-app-canvas dark:bg-[#0b0f17]">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-app-border/50 bg-white/90 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#0b0f17]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-app-accent to-[#6366f1] shadow-sm">
              <Library className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <span className="text-[17px] font-bold tracking-tight text-app-navy dark:text-white">
              Bookmark<span className="text-app-accent">Hub</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {navItems.map(item => {
              if (item.requiresFiles && !hasFiles) return null;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNav(item.id)}
                  title={item.desc}
                  className={`flex items-center gap-2 rounded-2xl px-3.5 py-2 text-[13px] font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-app-accent-soft text-app-accent shadow-sm dark:bg-app-accent/15 dark:text-blue-300'
                      : 'text-app-muted hover:bg-slate-100 hover:text-app-navy dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white'
                  }`}
                >
                  <item.icon className="h-4 w-4" strokeWidth={1.75} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex p-2 text-app-muted hover:bg-slate-100 rounded-xl transition-colors md:hidden dark:hover:bg-white/[0.08]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-app-border/50 bg-white dark:border-white/[0.06] dark:bg-[#0b0f17] md:hidden"
            >
              <div className="flex flex-col gap-1 px-4 py-3">
                {navItems.map(item => {
                  if (item.requiresFiles && !hasFiles) return null;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onNav(item.id)}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                        activeNav === item.id
                          ? 'bg-app-accent-soft text-app-accent dark:bg-app-accent/15 dark:text-blue-300'
                          : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/5'
                      }`}
                    >
                      <item.icon className="h-4 w-4" strokeWidth={1.75} />
                      <span>{item.label}</span>
                      <span className="ml-auto text-[11px] text-slate-400 dark:text-slate-500">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="space-y-8">
          {/* Session notice */}
          {sessionRestoredUi && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-app-accent/20 bg-app-accent-soft/70 px-5 py-3.5 text-center dark:border-app-accent/20 dark:bg-app-accent/8"
            >
              <p className="text-[13px] font-medium text-app-accent dark:text-blue-300">
                Session restored from local storage
              </p>
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-red-200/80 bg-red-50 px-5 py-4 text-center text-[14px] font-medium text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
            >
              {error}
            </motion.div>
          )}

          {/* Section: Upload */}
          <section id="section-upload" className="scroll-mt-24 space-y-5">
            <FileUpload />
            {hasFiles && (
              <button
                type="button"
                onClick={clearAll}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200/70 bg-white/60 px-6 py-3 text-[13px] font-semibold text-red-600 transition-all hover:border-red-300 hover:bg-red-50 hover:shadow-sm dark:border-red-900/40 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-950/20"
              >
                <Trash2 className="h-4 w-4" />
                Clear all files
              </button>
            )}
          </section>

          {hasFiles && (
            <div className="space-y-8">
              {/* Favorites */}
              <section id="section-favorites" className="scroll-mt-24">
                <FavoritesPanel />
              </section>

              {/* Stats */}
              <section id="section-stats" className="scroll-mt-24">
                <StatsPanel mergeResult={mergeResult} />
              </section>

              {/* Duplicate & Similar Reports */}
              <DuplicateReport />
              <SimilarBookmarksReport />

              {/* Preview / Tree */}
              <section id="section-preview" className="scroll-mt-24">
                <BookmarkTree />
              </section>

              {/* Tags */}
              <section id="section-tags" className="scroll-mt-24">
                <TagsPanel />
              </section>

              {/* Search History */}
              <section id="section-search-history" className="scroll-mt-24">
                <SearchHistoryPanel />
              </section>

              {/* Advanced Features */}
              <AdvancedFeaturesPanel />

              {/* Backup */}
              <section id="section-backup" className="scroll-mt-24">
                <BackupRestorePanel />
              </section>

              {/* Export */}
              <section id="section-export" className="scroll-mt-24">
                <ExportPanel />
              </section>
            </div>
          )}

          {/* Empty state */}
          {!hasFiles && (
            <div className="app-empty-state">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-app-accent/10 to-app-accent/5 shadow-soft ring-1 ring-app-accent/15 dark:from-app-accent/15 dark:to-app-accent/5">
                <LayoutDashboard className="h-8 w-8 text-app-accent" strokeWidth={1.5} />
              </div>
              <p className="text-xl font-bold text-app-navy dark:text-white">No files loaded</p>
              <p className="mx-auto mt-2 max-w-sm text-[14px] text-app-muted dark:text-slate-400">
                Import HTML or JSON bookmark exports to merge, deduplicate, and organize your bookmarks.
              </p>
            </div>
          )}
        </div>

        <footer className="mt-12 border-t border-app-border/50 pt-6 text-center text-[12px] text-app-muted dark:border-white/[0.06] dark:text-slate-500">
          <p>100% client-side — nothing leaves your browser.</p>
        </footer>
      </main>
      <OnboardingGuide hasFiles={hasFiles} onClose={() => {}} />
    </div>
  );
}

export default App;
