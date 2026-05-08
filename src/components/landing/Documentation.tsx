import { motion } from 'framer-motion';
import { Upload, GitMerge, Download, Search, Tags, Star, Undo2, Shield, Monitor } from 'lucide-react';

const sections = [
  { icon: Upload, title: 'Importing', items: ['Drop HTML/JSON files — auto-detects format', 'Works with Chrome, Firefox, Safari exports'], tip: 'Nothing leaves your browser.' },
  { icon: GitMerge, title: 'Merge & Dedup', items: ['Auto-merges matching folders, removes duplicate URLs', 'Flags similar bookmarks for your review'], tip: 'Empty folders cleaned automatically.' },
  { icon: Search, title: 'Browse & Search', items: ['Real-time search by title, filter by source file', 'Ctrl+F to search, folders expand/collapse'], tip: 'Source indicators show origin.' },
  { icon: Tags, title: 'Tags', items: ['Create colored tags, assign to bookmarks', 'Filter across folders by tag'], tip: 'Tags persist in session.' },
  { icon: Star, title: 'Favorites & Bulk', items: ['Star bookmarks, multi-select with checkboxes', 'Bulk move, edit, or delete'], tip: 'Ctrl+A selects all.' },
  { icon: Undo2, title: 'Undo', items: ['Tracks deletes, edits, moves (last 20)', 'Ctrl+Z / Ctrl+Shift+Z to redo'], tip: 'Everything is reversible.' },
  { icon: Download, title: 'Export', items: ['HTML, TXT, CSV, or Markdown', 'Right-click folders for individual export'], tip: 'Export in whatever format you need.' },
  { icon: Shield, title: 'Privacy', items: ['100% client-side, no accounts', 'localStorage only; clear with one click'], tip: 'Your data stays yours.' },
  { icon: Monitor, title: 'Advanced', items: ['Link health checks, orphan finder, auto-organize', 'Backup/restore workspace state'], tip: 'Health checks make real HTTP requests.' },
];

export function Documentation() {
  return (
    <section id="documentation" className="py-16 sm:py-20 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">Documentation</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Quick reference for everything Bookmark Manager.</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sections.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-gray-200/60 dark:border-gray-800/60 bg-gray-50/50 dark:bg-gray-900/50 p-4 hover:shadow-md hover:border-yellow-300 dark:hover:border-yellow-700 transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#e5ff47]/20 to-amber-500/20">
                    <Icon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">{s.title}</h3>
                </div>

                <ul className="space-y-1 mb-2.5">
                  {s.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                      <span className="mt-0.5 block h-1 w-1 shrink-0 rounded-full bg-gray-400 dark:bg-gray-600" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="rounded-lg bg-yellow-50/80 dark:bg-yellow-900/20 border border-yellow-200/50 dark:border-yellow-800/30 px-2.5 py-1.5 text-[11px] text-yellow-800 dark:text-yellow-200">
                  {s.tip}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
