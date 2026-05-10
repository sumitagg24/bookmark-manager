import { Library, BarChart3, FolderTree, Download, Star, Tag, Clock, HardDrive } from 'lucide-react';
import type { FC } from 'react';

const items: { id: string; icon: typeof Library; label: string }[] = [
  { id: 'upload', icon: Library, label: 'Import files' },
  { id: 'favorites', icon: Star, label: 'Favorites' },
  { id: 'preview', icon: FolderTree, label: 'All Bookmarks' },
  { id: 'tags', icon: Tag, label: 'Tags' },
  { id: 'search-history', icon: Clock, label: 'Search History' },
  { id: 'stats', icon: BarChart3, label: 'Statistics' },
  { id: 'backup', icon: HardDrive, label: 'Backup & Restore' },
  { id: 'export', icon: Download, label: 'Export' },
];

type DashboardNavProps = {
   activeId: string;
   onSelect: (id: string) => void;
   /** When false, only Import is enabled (other sections are not on the page). */
   hasFiles: boolean;
};

const tooltipLabels: Record<string, string> = {
   upload: 'Import files',
   favorites: 'Favorites',
   stats: 'Statistics',
   preview: 'All Bookmarks',
   tags: 'Tags',
   'search-history': 'Search History',
   export: 'Export',
   backup: 'Backup & Restore',
 };

export const DashboardNav: FC<DashboardNavProps> = ({ activeId, onSelect, hasFiles }) => {
   return (
     <nav
       className="flex flex-col items-center gap-1.5 py-2"
       aria-label="Dashboard sections"
     >
       {items.map((item) => {
         const Icon = item.icon;
         const active = activeId === item.id;
         const disabled = !hasFiles && item.id !== 'upload';

         return (
           <div key={item.id} className="relative group">
             <button
               type="button"
               title={disabled ? 'Import files first' : tooltipLabels[item.id] || item.label}
               aria-label={item.label}
               aria-current={active ? 'true' : undefined}
               disabled={disabled}
               onClick={() => {
                 if (!disabled) onSelect(item.id);
               }}
               className={`flex h-[52px] w-[52px] items-center justify-center rounded-2xl transition-all duration-300 ease-out ${
                 disabled
                   ? 'cursor-not-allowed opacity-35 grayscale'
                   : active
                     ? 'scale-105 bg-gradient-to-br from-premium-orange to-[#e84e1f] text-white shadow-premium-btn'
                     : 'text-slate-400 hover:scale-[1.02] hover:bg-slate-100 hover:text-premium-navy dark:text-slate-500 dark:hover:bg-white/10 dark:hover:text-white'
               } `}
             >
               <Icon className="h-[22px] w-[22px]" strokeWidth={1.65} />
             </button>
             <div className="absolute left-[60px] top-1/2 -translate-y-1/2 hidden md:group-hover:block pointer-events-none">
               <div className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[12px] whitespace-nowrap shadow-lg">
                 {tooltipLabels[item.id] || item.label}
               </div>
             </div>
           </div>
         );
       })}
     </nav>
   );
};
