import { motion } from 'framer-motion';
import { Heart, Scale, AlertCircle, FileText } from 'lucide-react';

const items = [
  { icon: Heart, title: 'Free', desc: 'Free for any use — personal, educational, or commercial.' },
  { icon: Scale, title: 'MIT License', desc: 'Free to use, copy, modify, and distribute.' },
  { icon: AlertCircle, title: 'No Warranty', desc: 'Provided "as is", without warranty of any kind.' },
  { icon: FileText, title: 'Acceptance', desc: 'Using this tool means you agree to these terms.' },
];

export function Terms() {
  return (
    <section id="terms" className="py-16 sm:py-20 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8 text-center">
          <div className="flex justify-center mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gray-200/60 dark:from-gray-700/60 to-gray-100/60 dark:to-gray-800/60">
              <Scale className="h-5 w-5 text-gray-700 dark:text-gray-300" strokeWidth={1.5} />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">Terms of Use</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Simple terms for a simple tool.</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-2.5">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-gray-200/60 dark:border-gray-800/60 bg-gray-50/50 dark:bg-gray-900/50 p-3.5 flex items-center gap-3"
              >
                <Icon className="h-4 w-4 shrink-0 text-gray-600 dark:text-gray-400" strokeWidth={1.5} />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="mt-5 text-center text-xs text-gray-500 dark:text-gray-400 font-mono"
        >
          MIT License &copy; 2026. Full text on <a href="https://github.com/sumitagg24/bookmark-manager" className="underline" target="_blank" rel="noopener noreferrer">GitHub</a>.
        </motion.div>
      </div>
    </section>
  );
}
