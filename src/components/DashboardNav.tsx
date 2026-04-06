import { Library, BarChart3, FolderTree, Download } from 'lucide-react';
import type { FC } from 'react';

const items: { id: string; icon: typeof Library; label: string }[] = [
  { id: 'upload', icon: Library, label: 'Import files' },
  { id: 'stats', icon: BarChart3, label: 'Statistics' },
  { id: 'preview', icon: FolderTree, label: 'Preview' },
  { id: 'export', icon: Download, label: 'Export' },
];

type DashboardNavProps = {
  activeId: string;
  onSelect: (id: string) => void;
  /** When false, only Import is enabled (other sections are not on the page). */
  hasFiles: boolean;
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
          <button
            key={item.id}
            type="button"
            title={disabled ? 'Import files first' : item.label}
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
        );
      })}
    </nav>
  );
};
