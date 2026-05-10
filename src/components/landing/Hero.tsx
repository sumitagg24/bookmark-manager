import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function ChromeLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="2.5"/>
      <circle cx="24" cy="24" r="10" fill="none" stroke="currentColor" strokeWidth="2.5"/>
      <path d="M24 4c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12z" fill="none" stroke="url(#chrome-grad)" strokeWidth="2.5"/>
      <defs><linearGradient id="chrome-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4285F4"/><stop offset="33%" stopColor="#EA4335"/><stop offset="66%" stopColor="#FBBC05"/><stop offset="100%" stopColor="#34A853"/></linearGradient></defs>
    </svg>
  );
}

function FirefoxLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className}>
      <circle cx="24" cy="24" r="20" fill="#FF7139"/><circle cx="24" cy="24" r="10" fill="#FF7139" opacity="0.6"/><circle cx="24" cy="24" r="5" fill="#FF7139" opacity="0.3"/>
      <path d="M24 8 L16 24 L24 22 L32 24 Z" fill="white" opacity="0.9"/><path d="M24 22 L14 34 L24 30 L34 34 Z" fill="white" opacity="0.7"/>
    </svg>
  );
}

function SafariLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2.5"/><circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M24 6 L24 14 M24 34 L24 42 M6 24 L14 24 M34 24 L42 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="24" cy="24" r="3" fill="#5AC8FA"/>
    </svg>
  );
}

function EdgeLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <path d="M8 8 L24 4 L40 8 L40 24 L24 28 L8 24 Z" fill="none" stroke="currentColor" strokeWidth="2.5"/>
      <path d="M8 8 L40 8 M8 24 L40 24 L40 40 L8 40 Z" fill="none" stroke="currentColor" strokeWidth="2.5"/>
      <circle cx="24" cy="16" r="2.5" fill="#0078D4"/><circle cx="24" cy="24" r="2.5" fill="#0078D4"/><circle cx="24" cy="32" r="2.5" fill="#0078D4"/>
    </svg>
  );
}

function BraveLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="2.5"/>
      <path d="M24 8 L16 26 L24 22 L32 26 Z" fill="#FB542B"/><path d="M24 22 L12 38 L24 32 L36 38 Z" fill="#FB542B"/>
      <path d="M10 24 L7 33 L13 29 M38 24 L41 33 L35 29" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

const browsers = [
  { name: 'Chrome', Logo: ChromeLogo, color: '#4285F4', accent: 'bg-blue-500/10' },
  { name: 'Firefox', Logo: FirefoxLogo, color: '#FF7139', accent: 'bg-orange-500/10' },
  { name: 'Safari', Logo: SafariLogo, color: '#5AC8FA', accent: 'bg-cyan-500/10' },
  { name: 'Edge', Logo: EdgeLogo, color: '#0078D4', accent: 'bg-blue-600/10' },
  { name: 'Brave', Logo: BraveLogo, color: '#FB542B', accent: 'bg-red-500/10' },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-yellow-50/20 to-white dark:from-gray-950 dark:via-gray-900/50 dark:to-gray-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-yellow-400/10 to-amber-400/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pt-20 sm:pt-32 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 border border-yellow-200/50 dark:border-yellow-700/30 text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
            v2.0 — Now with enhanced privacy & GitHub integration
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-gray-900 dark:text-white mb-6">
            Your Bookmarks.{' '}
            <span className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 bg-clip-text text-transparent">
              Organized.
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            Merge, deduplicate, and export bookmarks from all major browsers.
            <span className="hidden sm:inline"> All processing happens locally — </span>
            <span className="font-semibold text-gray-900 dark:text-white">no uploads, no accounts, no tracking.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-16">
            <Link
              to="/tool"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#e5ff47] to-amber-400 text-[#0a0a0a] font-semibold text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-5 min-h-[56px] shadow-lg hover:shadow-xl hover:from-amber-400 hover:to-[#e5ff47] transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto"
            >
              <span>Get Started Free</span>
              <svg className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a
              href="https://github.com/sumitagg24/bookmark-manager"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 rounded-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-5 min-h-[56px] shadow-lg hover:shadow-xl hover:border-yellow-400 dark:hover:border-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-300 transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto"
            >
              <GithubIcon className="h-5 w-5" />
              <span>Star on GitHub</span>
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-8"
          >
            {browsers.map(({ name, Logo, color, accent }, index) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                whileHover={{ scale: 1.1, y: -5, transition: { type: "spring", stiffness: 400, damping: 10 } }}
                className="group relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
                style={{boxShadow: `0 4px 6px -1px ${color}15`} as React.CSSProperties}
              >
                <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${accent}`} />
                <Logo className="relative z-10 h-9 w-9 sm:h-11 sm:w-11 text-gray-800 dark:text-white transition-transform group-hover:scale-110" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/4 right-1/4 w-4 h-4 bg-yellow-400 rounded-full opacity-60" />
      <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-amber-400 rounded-full opacity-60" />
    </section>
  );
}
