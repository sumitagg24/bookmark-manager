import { useEffect, useState, type FC } from 'react';

const STORAGE_KEY = 'bookmark-theme';

function readInitialDark(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light') return false;
  if (stored === 'dark') return true;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export const ThemeToggle: FC = () => {
  const [dark, setDark] = useState(readInitialDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
  }, [dark]);

  const toggle = () => setDark((d) => !d);

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        role="switch"
        aria-checked={dark}
        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={toggle}
        className="relative inline-flex h-[30px] w-[52px] shrink-0 cursor-pointer items-center rounded-full border border-app-border/60 bg-slate-200/80 p-0.5 shadow-inner transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent/40 dark:border-white/[0.12] dark:bg-slate-700/70"
      >
        <span
          aria-hidden
          className={`pointer-events-none block h-[24px] w-[24px] rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] dark:ring-white/10 ${
            dark ? 'translate-x-[24px]' : 'translate-x-0'
          }`}
        />
        {dark ? (
          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px]" aria-hidden>🌙</span>
        ) : (
          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px]" aria-hidden>☀️</span>
        )}
      </button>
    </div>
  );
};
