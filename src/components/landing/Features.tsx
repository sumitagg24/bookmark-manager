import { motion } from 'framer-motion';
import { 
  FileJson, 
  GitMerge, 
  Link2, 
  Shield, 
  Zap, 
  Globe, 
  Lock, 
  Clock 
} from 'lucide-react';

const features = [
  {
    icon: FileJson,
    title: 'Universal Import',
    description: 'Drop Any Export, Instantly.',
    detail: 'Native support for HTML and JSON from Chrome, Firefox, Safari, Edge, and Brave.',
    gradient: 'from-blue-500/20 to-indigo-500/10',
    iconColor: 'text-blue-600 dark:text-blue-400',
    bgGradient: 'from-blue-500/5 to-indigo-500/5',
  },
  {
    icon: GitMerge,
    title: 'Smart Folder Merging',
    description: 'Merge Without the Mess.',
    detail: 'Intelligently combines duplicate folders while preserving your hierarchy structure.',
    gradient: 'from-purple-500/20 to-pink-500/10',
    iconColor: 'text-purple-600 dark:text-purple-400',
    bgGradient: 'from-purple-500/5 to-pink-500/5',
  },
  {
    icon: Link2,
    title: 'AI-Powered Deduplication',
    description: 'One Link. One Entry.',
    detail: 'Automatically detects and merges duplicate URLs, keeping your library clean.',
    gradient: 'from-emerald-500/20 to-teal-500/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    bgGradient: 'from-emerald-500/5 to-teal-500/5',
  },
  {
    icon: Shield,
    title: '100% Private & Local',
    description: 'Your Data Never Leaves.',
    detail: 'All processing happens in your browser. Zero server uploads, complete privacy.',
    gradient: 'from-orange-500/20 to-red-500/10',
    iconColor: 'text-orange-600 dark:text-orange-400',
    bgGradient: 'from-orange-500/5 to-red-500/5',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Instant Results.',
    detail: 'Built with modern tech stack for incredible speed. 1000+ bookmarks in milliseconds.',
    gradient: 'from-yellow-500/20 to-amber-500/10',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    bgGradient: 'from-yellow-500/5 to-amber-500/5',
  },
  {
    icon: Globe,
    title: 'Cross-Browser Sync',
    description: 'All Your Bookmarks, Unified.',
    detail: 'Import from any browser and export back anywhere. Seamless migration.',
    gradient: 'from-cyan-500/20 to-blue-500/10',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    bgGradient: 'from-cyan-500/5 to-blue-500/5',
  },
  {
    icon: Lock,
    title: 'Secure by Design',
    description: 'Your Privacy, Guaranteed.',
    detail: 'No accounts, no cloud storage, no data collection. You own everything.',
    gradient: 'from-rose-500/20 to-pink-500/10',
    iconColor: 'text-rose-600 dark:text-rose-400',
    bgGradient: 'from-rose-500/5 to-pink-500/5',
  },
  {
    icon: Clock,
    title: 'Session Persistence',
    description: 'Never Lose Your Work.',
    detail: 'Your session is automatically saved. Return anytime and pick up where you left.',
    gradient: 'from-sky-500/20 to-cyan-500/10',
    iconColor: 'text-sky-600 dark:text-sky-400',
    bgGradient: 'from-sky-500/5 to-cyan-500/5',
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-gray-50/50 dark:bg-gray-950/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-gray-900 dark:text-white mb-4">
            Everything you need.
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
              Nothing you don't.
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Powerful features built with simplicity in mind. No learning curve, just results.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ 
                  y: -6, 
                  transition: { type: "spring", stiffness: 300, damping: 15 }
                }}
                className="group relative flex flex-col p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-gray-900/50 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/20 dark:hover:shadow-gray-900/20"
              >
                <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className={`relative mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.gradient}`}>
                  <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${feature.iconColor}`} strokeWidth={1.5} />
                </div>
                
                <div className="relative flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
                    {feature.title}
                  </h3>
                  <p className={`text-sm sm:text-base font-medium mb-1 ${feature.iconColor}`}>
                    {feature.description}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.detail}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
