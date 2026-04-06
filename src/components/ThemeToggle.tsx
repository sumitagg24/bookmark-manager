import { useEffect, useState, type FC } from 'react';

const STORAGE_KEY = 'bookmark-theme';

function readInitialDark(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light') return false;
  if (stored === 'dark') return true;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Light / dark appearance as a sliding on–off style switch (dark = “on”).
 */
export const ThemeToggle: FC = () => {
  const [dark, setDark] = useState(readInitialDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
  }, [dark]);

  const toggle = () => setDark((d) => !d);

  return (
    <div className="flex items-center gap-3">
      <span
        className={`text-[12px] font-semibold tracking-wide transition-colors ${
          !dark ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-500'
        }`}
      >
        Light
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={dark}
        aria-label={dark ? 'Dark mode on. Switch to light mode.' : 'Light mode on. Switch to dark mode.'}
        onClick={toggle}
        className="group relative inline-flex h-[30px] w-[52px] shrink-0 cursor-pointer items-center rounded-full border border-slate-200/90 bg-slate-200/90 p-0.5 shadow-inner transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-orange/50 focus-visible:ring-offset-2 dark:border-white/15 dark:bg-slate-700/90 dark:focus-visible:ring-offset-slate-900"
      >
        <span
          aria-hidden
          className={`pointer-events-none block h-[26px] w-[26px] rounded-full bg-white shadow-md ring-1 ring-black/5 transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] dark:ring-white/10 ${
            dark ? 'translate-x-[22px]' : 'translate-x-0'
          }`}
        />
        {/* Track tint when “on” (dark) */}
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-premium-navy/25 to-premium-orange/20 transition-opacity ${
            dark ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </button>

      <span
        className={`text-[12px] font-semibold tracking-wide transition-colors ${
          dark ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-500'
        }`}
      >
        Dark
      </span>
    </div>
  );
};
