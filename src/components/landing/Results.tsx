import { motion } from 'framer-motion';
import { TrendingDown, Layers, Clock, Database } from 'lucide-react';

const results = [
  {
    icon: TrendingDown,
    metric: '87%',
    label: 'Fewer duplicates after merge',
    description: 'Average reduction in duplicate bookmarks',
  },
  {
    icon: Layers,
    metric: '3×',
    label: 'Faster organization',
    description: 'Compared to manual sorting',
  },
  {
    icon: Clock,
    metric: '<1s',
    label: 'Processing time',
    description: 'For 1000+ bookmarks',
  },
  {
    icon: Database,
    metric: '100%',
    label: 'Client-side',
    description: 'Your data never leaves browser',
  },
];

export function Results() {
  return (
    <section className="py-24 sm:py-32 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-pink-900/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-gray-900 dark:text-white mb-4">
            Real results.{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Real fast.
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            See what our users achieve with smart bookmark management.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {results.map((result, index) => {
            const Icon = result.icon;
            return (
              <motion.div
                key={result.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="relative group p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                      <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {result.metric}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {result.label}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {result.description}
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
