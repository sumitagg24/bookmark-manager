import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Library } from 'lucide-react';
import BookmarkApp from '../BookmarkApp';

export function ToolPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-app-canvas dark:bg-[#0b0f17]">
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => navigate('/')}
        className="fixed left-3 top-3 sm:left-4 sm:top-4 z-50 flex items-center gap-2 rounded-full bg-white/90 dark:bg-[#1a1a1a] px-3 sm:px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-gray-300 shadow-lg hover:bg-white dark:hover:bg-[#222] transition-colors min-h-[44px]"
        aria-label="Back to homepage"
      >
        <Library className="h-4 w-4" />
        <span className="hidden sm:inline">Back to Home</span>
      </motion.button>

      <div className="pt-20 sm:pt-16">
        <BookmarkApp />
      </div>
    </div>
  );
}
