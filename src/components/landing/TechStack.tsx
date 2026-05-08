import { motion } from 'framer-motion';
import { 
  Code2, 
  Palette, 
  Zap, 
  Database, 
  Wind, 
  Feather,
  FileCode
} from 'lucide-react';

const techStack = [
  { name: 'React 19', Icon: Code2, desc: 'Latest React with concurrent features' },
  { name: 'TypeScript', Icon: FileCode, desc: 'Type-safe development' },
  { name: 'Vite', Icon: Zap, desc: 'Lightning-fast builds' },
  { name: 'Tailwind CSS', Icon: Palette, desc: 'Utility-first styling' },
  { name: 'Zustand', Icon: Database, desc: 'Minimal state management' },
  { name: 'Framer Motion', Icon: Wind, desc: 'Smooth animations' },
  { name: 'Lucide', Icon: Feather, desc: 'Beautiful icons' },
];

// Simplified real code snippet
const codeSnippet = `// Merge folders intelligently
const mergeBookmarks = (files: File[]) => {
  return files.reduce((merged, file) => {
    file.folders.forEach(folder => {
      if (merged.has(folder.name)) {
        // Merge recursively
        merged.set(folder.name, 
          mergeBookmarks([folder]))
      } else {
        merged.set(folder.name, folder)
      }
    })
    return merged
  }, new Map())
}`;

export function TechStack() {
  return (
    <section id="open-source" className="py-24 sm:py-32 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-gray-900 dark:text-white mb-4">
            Built with modern,{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              open-source tech.
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            No proprietary lock-in. Fork it, modify it, own it.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Code block */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-900 overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 border-b border-gray-700">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="ml-2 text-xs text-gray-400">merger.ts — core logic</span>
              </div>
              <pre className="p-4 sm:p-6 overflow-x-auto">
                <code className="text-sm sm:text-base text-gray-300 font-mono leading-relaxed">
                  {codeSnippet.split('\n').map((line, i) => (
                    <div key={i} className="flex">
                      <span className="flex-shrink-0 w-8 sm:w-12 text-gray-600 select-none text-right pr-4">
                        {i + 1}
                      </span>
                      <span className={line.startsWith('//') ? 'text-gray-500' : ''}>{line}</span>
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </motion.div>

          {/* Tech pills grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-3 sm:gap-4"
          >
            {techStack.map((tech, index) => {
              const Icon = tech.Icon;
              return (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.03, y: -3 }}
                  className="group relative flex flex-col p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 group-hover:from-blue-500/20 group-hover:to-cyan-500/20 transition-all">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                      {tech.name}
                    </span>
                  </div>
                  <p className="relative text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {tech.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
