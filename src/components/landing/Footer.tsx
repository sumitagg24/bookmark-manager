import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';

// GitHub icon
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

// X icon
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// Discord icon
function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.317 4.3698a19.791 19.791 0 00-4.8851-1.5152.0741.0741 0 00-.0784.0371c-.2104.3754-.4449.8647-.6083 1.2495a18.27 18.27 0 00-5.4872 0 12.64 12.64 0 00-.6173 1.2495.0772.0772 0 00-.0785.037.19.19 0 00-.0329.0277C.5337 9.0458-.3197 13.58.0992 18.0578a.0823.0823 0 00.0312.0571 19.9 19.9 0 005.9959 3.03.0784.0784 0 00.0841-.0281c.4624-.63.8746-1.295 1.226-1.9942a.076.076 0 00-.0417-.1061 13.107 13.107 0 01-1.8726-.8922.0773.0773 0 01-.0081-.1285 10.2 10.2 0 00.3726-.2924.0743.0743 0 01.0776-.0105c3.9287 1.7935 8.18 1.7935 12.0618 0a.0739.0739 0 01.0785.0095c.1206.098.2454.198.3736.2924.0138.0137.02.0314.0177.0495a13.298 13.298 0 01-1.8766.8945.0786.0786 0 00-.0423.1062.0749.0749 0 00.0153.0652c.3588.6945.7737 1.3643 1.225 1.9942a.0766.0766 0 00.084.0285 19.839 19.839 0 006.0025-3.0299.0779.0779 0 00.0323-.0566.19.19 0 00-.0312-.0575 19.739 19.739 0 00-5.4881 0 .1949.1949 0 00-.0323.0575.0787.0787 0 00.0311.0568 19.84 19.84 0 006.0025 3.0299.076.076 0 00.084-.0285c.3588-.6945.7737-1.3642 1.225-1.9942a.077.077 0 00-.0422-.1062 13.107 13.107 0 01-1.8726.8922.0768.0768 0 01-.0081-.1285 10.2 10.2 0 00.3726-.2924.0743.0743 0 01.0775-.0105c3.9287 1.7935 8.18 1.7935 12.0618 0a.0739.0739 0 01.0785.0095c.1206.098.2454.198.3736.2924.0138.0137.02.0314.0177.0495a13.298 13.298 0 01-1.8766.8945.0786.0786 0 00-.0423.1062zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

const footerLinks = {
  product: [
    { label: 'Features', href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Open Tool', href: '/tool' },
  ],
  openSource: [
    { label: 'GitHub', href: 'https://github.com/sumitagg24/bookmark-manager' },
    { label: 'Issues', href: 'https://github.com/sumitagg24/bookmark-manager/issues' },
    { label: 'Contributing', href: 'https://github.com/sumitagg24/bookmark-manager' },
  ],
  resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'Changelog', href: 'https://github.com/sumitagg24/bookmark-manager' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ],
};

const socialLinks = [
  { icon: GithubIcon, href: 'https://github.com/sumitagg24/bookmark-manager', label: 'GitHub' },
  { icon: XIcon, href: '#', label: 'X' },
  { icon: DiscordIcon, href: '#', label: 'Discord' },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#e5ff47] to-amber-500 transition-transform group-hover:scale-105 shadow-lg">
                <Bookmark className="h-5 w-5 text-gray-900" />
              </div>
              <span className="text-lg font-bold text-white">Bookmark Manager</span>
            </Link>
            <p className="text-sm text-gray-400">
              Merge, deduplicate, and export bookmarks. 100% private, open-source, free.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-sm">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Open Source */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Open Source</h4>
            <ul className="space-y-2 text-sm">
              {footerLinks.openSource.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2 text-sm">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith('http') ? (
                    <a href={link.href} className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                      {link.label}
                    </a>
                  ) : (
                    <Link to={link.href} className="text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Bookmark Manager. MIT License.
          </p>
          <div className="flex gap-3">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                className="h-9 w-9 flex items-center justify-center rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 hover:bg-gray-700 transition-all"
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
