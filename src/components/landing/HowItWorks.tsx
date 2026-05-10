import { motion } from 'framer-motion';
import { 
  FileJson, 
  GitMerge, 
  CheckCircle, 
  Download,
  Sparkles
} from 'lucide-react';

const steps = [
  {
    icon: FileJson,
    title: '1. Drop Your Exports',
    description: 'Simply drag and drop HTML/JSON files from any browser. We auto-detect the format.',
    highlight: 'No manual parsing needed',
  },
  {
    icon: GitMerge,
    title: '2. Smart Merge & Review',
    description: 'Our algorithm merges folders intelligently while preserving your structure. Review before accepting.',
    highlight: 'Full control over results',
  },
  {
    icon: CheckCircle,
    title: '3. Auto Deduplication',
    description: 'Duplicate URLs are automatically detected and merged. Keep one clean entry per link.',
    highlight: 'Clean in one click',
  },
  {
    icon: Download,
    title: '4. Export Anywhere',
    description: 'Export as HTML (for browsers), CSV (for spreadsheets), or plain URLs (for scripts).',
    highlight: 'Ready to import anywhere',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 text-center"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-gray-900 dark:text-white mb-4">
            Four steps to{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              bookmark nirvana.
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Import, merge, deduplicate, export — all in under a minute.
          </p>
        </motion.div>

        <div className="relative">
          {/* Desktop timeline line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 transform -translate-x-1/2" />
          
          <div className="space-y-12 lg:space-y-0">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`flex flex-col lg:flex-row gap-6 lg:gap-12 items-center ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Step number/icon */}
                <div className={`flex-1 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex flex-col items-start gap-3"
                  >
                    <div className="relative">
                      <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 shadow-lg">
                        <step.icon className="h-8 w-8 sm:h-10 sm:w-10 text-white dark:text-gray-900" />
                      </div>
                      <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                        {index + 1}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 max-w-md">
                        {step.description}
                      </p>
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
                        <Sparkles className="h-3.5 w-3.5" />
                        {step.highlight}
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Visual representation */}
                <div className="flex-1 w-full">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="relative h-48 sm:h-56 rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl"
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      {index === 0 && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-lg border-2 border-dashed border-blue-400">
                          <FileJson className="h-8 w-8 text-blue-500" />
                          <div className="text-sm font-mono">
                            <div className="text-gray-900 dark:text-white font-medium">bookmarks.html</div>
                            <div className="text-gray-500 text-xs">Drag & drop here</div>
                          </div>
                        </div>
                      )}
                      {index === 1 && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-lg">
                          <GitMerge className="h-8 w-8 text-purple-500" />
                          <div className="flex -space-x-2">
                            {[1,2,3].map((i) => (
                              <div key={i} className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-white dark:border-gray-800" />
                            ))}
                          </div>
                        </div>
                      )}
                      {index === 2 && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-lg">
                          <div className="relative">
                            <CheckCircle className="h-10 w-10 text-emerald-500" />
                            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center font-bold">
                              ✓
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Duplicates removed</div>
                            <div className="text-xl font-bold text-gray-900 dark:text-white">−87%</div>
                          </div>
                        </div>
                      )}
                      {index === 3 && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-lg">
                          <Download className="h-8 w-8 text-orange-500" />
                          <div className="flex gap-2">
                            <div className="px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium">HTML</div>
                            <div className="px-3 py-1 rounded-lg bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-medium">CSV</div>
                            <div className="px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-medium">TXT</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
