import { motion, useScroll, useTransform } from 'framer-motion';
import { useState } from 'react';
import { Library } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../ThemeToggle';

// Simple GitHub icon component
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

// Menu icon for mobile hamburger
function MenuIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

// Close icon for mobile menu
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function LandingNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isToolPage = location.pathname.startsWith('/tool');
  const isLandingPage = location.pathname === '/';
  const { scrollY } = useScroll();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const shadowOpacity = useTransform(scrollY, [0, 50], [0, 0.1]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      if (isLandingPage) {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        navigate('/');
        setTimeout(() => {
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Docs', href: '#documentation' },
    { label: 'Open Source', href: 'https://github.com/sumitagg24/bookmark-manager' },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed left-2 right-2 top-2 sm:left-4 sm:top-4 z-50 mx-auto max-w-5xl"
    >
      <motion.div
        style={{ 
          boxShadow: `rgba(0, 0, 0, ${shadowOpacity}) 0 4px 12px`,
        }}
        className="blink-nav-pill flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group" onClick={() => setMobileMenuOpen(false)}>
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#e5ff47]/15 to-transparent group-hover:from-[#e5ff47]/25 transition-all">
            <Library className="h-4 w-4 sm:h-5 sm:w-5 text-[#e5ff47]" strokeWidth={1.75} />
          </div>
          <span className="hidden sm:block font-bold text-gray-900 dark:text-white text-sm sm:text-base">
            Bookmark Manager
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            link.href.startsWith('http') ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {link.label}
              </a>
            )
          ))}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-1 sm:gap-3">
          {/* GitHub Star - always visible */}
          <a
            href="https://github.com/sumitagg24/bookmark-manager"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-nav-ghost flex items-center gap-1 sm:gap-2 py-2 px-2 sm:px-4 min-h-[44px]"
            aria-label="Star on GitHub"
          >
            <GithubIcon className="h-4 w-4" />
            <span className="hidden sm:inline text-xs sm:text-sm">Star</span>
          </a>

          {/* Theme toggle */}
          <div className="hidden sm:flex items-center">
            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden btn-nav-ghost p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? (
              <XIcon className="h-5 w-5" />
            ) : (
              <MenuIcon className="h-5 w-5" />
            )}
          </button>

          {/* CTA Button */}
          {isToolPage ? (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hidden sm:flex cursor-default items-center gap-2 text-sm px-5 py-2.5 min-h-[44px] rounded-full bg-gradient-to-r from-[#e5ff47]/80 to-amber-400/80 text-gray-900 font-semibold shadow-sm"
            >
              Tool Active
            </motion.span>
          ) : (
            <motion.div
              className="hidden sm:block"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: [0, -2, 0],
              }}
              transition={{ 
                opacity: { duration: 0.3 },
                scale: { duration: 0.3 },
                y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
              }}
            >
              <motion.div
                animate={{ 
                  boxShadow: [
                    '0 0 0 0 rgba(229,255,71,0.5)',
                    '0 0 0 10px rgba(229,255,71,0)',
                    '0 0 0 0 rgba(229,255,71,0.5)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="rounded-full"
              >
                <Link 
                  to="/tool" 
                  className="flex items-center gap-2 text-sm px-5 py-2.5 min-h-[44px] rounded-full bg-gradient-to-r from-[#e5ff47] to-amber-400 text-gray-900 font-semibold shadow-lg"
                >
                  <motion.span
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                    </svg>
                  </motion.span>
                  <motion.span
                    animate={{ opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    Open Tool
                  </motion.span>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed inset-x-2 top-16 z-40 lg:hidden"
        >
          <div className="blink-nav-pill p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                link.href.startsWith('http') ? (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
                  >
                    {link.label}
                  </a>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
                  >
                    {link.label}
                  </a>
                )
              ))}
              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
                <ThemeToggle />
              </div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="mt-2"
              >
                <Link
                  to="/tool"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#e5ff47] to-amber-400 text-gray-900 font-semibold shadow-lg"
                >
                  Open Bookmark Manager
                </Link>
              </motion.div>
            </nav>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
