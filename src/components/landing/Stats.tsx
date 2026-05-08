import { motion } from 'framer-motion';
import { Monitor, Shield, FileJson, Lock, Globe, Zap } from 'lucide-react';

const stats = [
  { icon: Globe, value: '5+', label: 'Browsers Supported' },
  { icon: Shield, value: '0', label: 'Cloud Uploads' },
  { icon: FileJson, value: '3+', label: 'Export Formats' },
  { icon: Lock, value: '100%', label: 'Private Processing' },
  { icon: Zap, value: '<10ms', label: 'Avg. Merge Time' },
  { icon: Monitor, value: '∞', label: 'Forever Free' },
];

export function Stats() {
  return (
    <section className="py-20 sm:py-24 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-950/50 dark:to-gray-950 border-y border-gray-200/50 dark:border-gray-800/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group relative text-center p-4 sm:p-6 rounded-2xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex justify-center mb-3 sm:mb-4">
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20"
                >
                  <stat.icon className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 dark:text-blue-400" />
                </motion.div>
              </div>
              <motion.div 
                className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-1"
                whileHover={{ scale: 1.05 }}
              >
                {stat.value}
              </motion.div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-tight">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
