import { useState } from 'react';
import { type FC } from 'react';
import { Globe } from 'lucide-react';

interface FaviconProps {
  url?: string | null;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const sizeIconMap: Record<string, string> = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

function extractDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace('www.', '');
  } catch {
    return '';
  }
}

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    '#ee5050', '#eb7129', '#d4aa1c', '#87c33a', '#32a35a',
    '#1e9ad8', '#5c70c7', '#8a52c4', '#c84aad', '#d14386',
    '#ef5d55', '#f49920', '#f9c92d', '#7cc550', '#4bbb7b',
    '#2f96d4', '#6d82c9', '#9067c7', '#c750a5', '#d45989',
  ];
  return colors[Math.abs(hash) % colors.length];
}

export const Favicon: FC<FaviconProps> = ({ url, title, size = 'md', className = '' }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const domain = url ? extractDomain(url) : '';
  const googleFavicon = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : '';
  const avatarLetter = title?.charAt(0)?.toUpperCase() || '?';
  const bgColor = stringToColor(domain || title || 'default');

  if (!url) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-lg flex items-center justify-center shrink-0 ${className}`}
        style={{ backgroundColor: bgColor }}
      >
        <Globe className={`${sizeIconMap[size]} text-white`} />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-lg flex items-center justify-center shrink-0 ${className}`}
        style={{ backgroundColor: bgColor }}
      >
        <span className={`${sizeIconMap[size]} font-bold text-white`}>{avatarLetter}</span>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} shrink-0 ${className}`}>
      <img
        src={googleFavicon}
        alt=""
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`${sizeClasses[size]} object-contain rounded-lg transition-opacity duration-200 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ backgroundColor: '#f3f4f6' }}
      />
      {!loaded && !error && (
        <div
          className={`${sizeClasses[size]} absolute inset-0 rounded-lg animate-pulse`}
          style={{ backgroundColor: '#e5e7eb' }}
        />
      )}
    </div>
  );
};
