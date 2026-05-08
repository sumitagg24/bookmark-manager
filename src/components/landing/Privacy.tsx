import { motion } from 'framer-motion';
import { Shield, Server, Eye, Lock } from 'lucide-react';

const points = [
  { icon: Server, title: 'Zero Uploads', desc: 'All processing is in-browser. Nothing leaves your machine.' },
  { icon: Eye, title: 'No Tracking', desc: 'No cookies, no analytics, no data collection.' },
  { icon: Lock, title: 'No Accounts', desc: 'No sign-up needed. Just open and use.' },
  { icon: Shield, title: 'Open Source', desc: 'Fully auditable. Inspect or self-host on GitHub.' },
];

export function Privacy() {
  return (
    <section id="privacy" className="py-16 sm:py-20 bg-gray-50/50 dark:bg-gray-950/50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8 text-center">
          <div className="flex justify-center mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20">
              <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">Privacy Policy</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">We don&apos;t collect, store, or transmit your data. Period.</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-2.5">
          {points.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-gray-900 p-3.5 flex items-center gap-3"
              >
                <Icon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{p.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{p.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="mt-5 text-center text-xs text-gray-400 dark:text-gray-500"
        >
          Questions? <a href="https://github.com/sumitagg24/bookmark-manager" className="underline" target="_blank" rel="noopener noreferrer">Open an issue</a>.
        </motion.p>
      </div>
    </section>
  );
}
