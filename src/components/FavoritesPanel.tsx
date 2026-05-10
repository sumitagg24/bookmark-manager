import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, ExternalLink } from 'lucide-react';
import { useBookmarkStore } from '../store/bookmarkStore';
import type { BookmarkNode } from '../types/bookmark';
import { Favicon } from './Favicon';

export function FavoritesPanel() {
  const { mergeResult, toggleFavorite } = useBookmarkStore();

  const favorites = useMemo(() => {
    if (!mergeResult) return [];
    const favs: BookmarkNode[] = [];

    function collectFavorites(node: BookmarkNode) {
      if (node.type === 'bookmark' && node.isFavorite) {
        favs.push(node);
      }
      node.children?.forEach(collectFavorites);
    }

    collectFavorites(mergeResult.root);
    return favs;
  }, [mergeResult]);

  if (!mergeResult) {
    return (
      <div id="section-favorites" className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Favorites</h2>
          <p className="text-slate-600 dark:text-slate-400">Your starred bookmarks</p>
        </div>
        <div className="premium-card p-12 text-center">
          <p className="text-slate-500 dark:text-slate-400">Import bookmarks to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div id="section-favorites" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Favorites</h2>
        <p className="text-slate-600 dark:text-slate-400">Your starred bookmarks ({favorites.length})</p>
      </div>

       <div className="premium-card p-6">
         {favorites.length === 0 ? (
           <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="text-center py-12"
           >
             <div className="relative inline-block mb-4">
               <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center mx-auto">
                 <Star className="h-8 w-8 text-amber-500" strokeWidth={1.5} />
               </div>
               <div className="absolute -top-1 -right-1 w-4 h-4 bg-premium-orange rounded-full opacity-90 shadow-lg" />
             </div>
             <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No favorites yet</p>
             <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
               Star bookmarks from the preview to see them here
             </p>
           </motion.div>
         ) : (
           <div className="space-y-2">
             {favorites.map((bookmark) => (
               <motion.div
                 key={bookmark.id}
                 initial={{ opacity: 0, y: 4 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.2 }}
                 className="group flex items-center justify-between p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/90 dark:bg-slate-800/60 dark:hover:bg-slate-700/80 transition-all border border-slate-100/50 hover:border-slate-200/50 dark:border-white/[0.06] dark:hover:border-white/[0.1]"
               >
                 <div className="flex items-center gap-3 flex-1 min-w-0">
                   <Favicon url={bookmark.url} title={bookmark.title} size="sm" />
                   <div className="flex-1 min-w-0">
                     <p className="font-medium text-slate-900 dark:text-white truncate group-hover:text-premium-orange transition-colors">{bookmark.title}</p>
                     {bookmark.url && (
                       <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono">{bookmark.url}</p>
                     )}
                   </div>
                 </div>
                  <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                    {bookmark.url && (
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg text-slate-400 hover:text-premium-orange hover:bg-premium-orange/10 transition-colors"
                        title="Open link"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <button
                    onClick={() => toggleFavorite(bookmark.id)}
                    className="p-2 rounded-lg text-premium-orange hover:bg-premium-orange/10 transition-colors"
                    title="Remove from favorites"
                  >
                    <Star className="h-4 w-4 fill-current" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
