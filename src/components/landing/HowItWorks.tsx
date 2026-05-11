import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FileJson,
  GitMerge,
  CheckCircle,
  Download,
  Sparkles,
  Upload,
  ArrowRight,
} from 'lucide-react';

const steps = [
  {
    icon: FileJson,
    title: 'Drop Your Exports',
    description: 'Simply drag and drop HTML/JSON files from any browser. We auto-detect the format.',
    highlight: 'No manual parsing needed',
    gradient: 'from-blue-500 to-cyan-500',
    visual: 'upload',
  },
  {
    icon: GitMerge,
    title: 'Smart Merge & Review',
    description: 'Our algorithm merges folders intelligently while preserving your structure. Review before accepting.',
    highlight: 'Full control over results',
    gradient: 'from-purple-500 to-pink-500',
    visual: 'merge',
  },
  {
    icon: CheckCircle,
    title: 'Auto Deduplication',
    description: 'Duplicate URLs are automatically detected and merged. Keep one clean entry per link.',
    highlight: 'Clean in one click',
    gradient: 'from-emerald-500 to-teal-500',
    visual: 'dedup',
  },
  {
    icon: Download,
    title: 'Export Anywhere',
    description: 'Export as HTML (for browsers), CSV (for spreadsheets), or plain URLs (for scripts).',
    highlight: 'Ready to import anywhere',
    gradient: 'from-orange-500 to-red-500',
    visual: 'export',
  },
];

function FloatingParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-2 w-2 rounded-full"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 30}%`,
            background: i % 2 === 0 ? '#e5ff47' : '#f59e0b',
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function UploadAnimation() {
  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="flex items-center gap-3 rounded-xl bg-white dark:bg-gray-800 px-5 py-4 shadow-lg border-2 border-dashed border-blue-400"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Upload className="h-8 w-8 text-blue-500" />
        </motion.div>
        <div className="text-left">
          <div className="text-sm font-mono font-medium text-gray-900 dark:text-white">bookmarks.html</div>
          <div className="text-xs text-gray-500">Drag & drop here</div>
        </div>
      </motion.div>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatDelay: 1 }}
        className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
        style={{ maxWidth: '160px' }}
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="text-[11px] text-gray-500"
      >
        Parsing...
      </motion.p>
    </div>
  );
}

function MergeAnimation() {
  const circles = [
    { cx: 30, cy: 35, color: '#3B82F6', delay: 0 },
    { cx: 50, cy: 25, color: '#8B5CF6', delay: 0.3 },
    { cx: 40, cy: 50, color: '#EC4899', delay: 0.6 },
  ];
  return (
    <div className="flex items-center gap-4">
      <div className="relative h-16 w-16">
        {circles.map((c, i) => (
          <motion.div
            key={i}
            className="absolute h-8 w-8 rounded-full border-2 border-white dark:border-gray-800 shadow-md"
            style={{ backgroundColor: c.color }}
            animate={{
              x: [0, 20 - c.cx * 0.3, 0],
              y: [0, 15 - c.cy * 0.2, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: c.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <GitMerge className="h-6 w-6 text-purple-500" />
        </motion.div>
      </div>
      <div className="flex flex-col">
        <motion.div
          className="flex -space-x-1"
          animate={{ x: [0, 3, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="h-6 w-6 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${i === 1 ? '#3B82F6' : i === 2 ? '#8B5CF6' : '#EC4899'}, ${i === 1 ? '#6366F1' : i === 2 ? '#A855F7' : '#F472B6'})`,
              }}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </motion.div>
        <span className="mt-1 text-[10px] text-gray-400 font-medium">Merging folders...</span>
      </div>
    </div>
  );
}

function DedupAnimation() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        {['google.com', 'google.com', 'google.com/?src=fb'].map((url, i) => (
          <motion.div
            key={i}
            className="rounded-lg bg-white dark:bg-gray-800 px-3 py-2 shadow-md border text-[10px] font-mono text-gray-600 dark:text-gray-400"
            animate={
              i < 2
                ? { scale: [1, 0.8, 0], opacity: [1, 0.5, 0] }
                : { scale: [1, 1.15, 1], opacity: [1, 1, 1] }
            }
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
          >
            {url}
          </motion.div>
        ))}
      </div>
      <motion.div
        className="flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-4 py-1.5"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">-87% duplicates</span>
      </motion.div>
    </div>
  );
}

function ExportAnimation() {
  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div className="flex gap-2" animate={{ y: [0, -3, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
        <motion.div
          className="rounded-lg px-3 py-1.5 text-xs font-medium shadow-md"
          style={{ background: '#DBEAFE', color: '#1D4ED8' }}
          whileHover={{ scale: 1.1 }}
        >
          HTML
        </motion.div>
        <motion.div
          className="rounded-lg px-3 py-1.5 text-xs font-medium shadow-md"
          style={{ background: '#D1FAE5', color: '#047857' }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
        >
          CSV
        </motion.div>
        <motion.div
          className="rounded-lg px-3 py-1.5 text-xs font-medium shadow-md"
          style={{ background: '#EDE9FE', color: '#6D28D9' }}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: 0.6 }}
        >
          TXT
        </motion.div>
      </motion.div>
      <motion.div
        className="flex items-center gap-1 text-[11px] text-gray-500"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Download className="h-3 w-3" />
        Ready to download
      </motion.div>
    </div>
  );
}

const visualComponents: Record<string, React.FC> = {
  upload: UploadAnimation,
  merge: MergeAnimation,
  dedup: DedupAnimation,
  export: ExportAnimation,
};

function TimelineLine() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start center', 'end center'],
  });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div ref={ref} className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2">
      <motion.div
        className="h-full w-full bg-gradient-to-b from-[#e5ff47] via-amber-400 to-orange-500"
        style={{ scaleY, originY: 0 }}
      />
    </div>
  );
}

export function HowItWorks() {
  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true });

  return (
    <section id="how-it-works" className="relative py-24 sm:py-32 bg-white dark:bg-gray-950 overflow-hidden">
      <FloatingParticles />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={titleInView ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 border border-yellow-200/50 dark:border-yellow-800/30 text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-6"
          >
            <Sparkles className="h-4 w-4" />
            Works in under a minute
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-gray-900 dark:text-white mb-4">
            Four steps to{' '}
            <span className="bg-gradient-to-r from-[#e5ff47] via-amber-400 to-orange-500 bg-clip-text text-transparent">
              clean bookmarks.
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Import, merge, deduplicate, export — all in your browser, nothing leaves your machine.
          </p>
        </motion.div>

        <div className="relative">
          <TimelineLine />

          <div className="space-y-16 lg:space-y-0">
            {steps.map((step, index) => {
              const VisualComponent = visualComponents[step.visual];
              const isLeft = index % 2 === 0;

              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6 }}
                  className={`relative flex flex-col lg:flex-row gap-8 lg:gap-16 items-center ${
                    index > 0 ? 'lg:mt-[-80px]' : ''
                  }`}
                >
                  {/* Timeline dot */}
                  <motion.div
                    className="hidden lg:flex absolute left-1/2 -translate-x-1/2 z-10"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                  >
                    <motion.div
                      className="h-6 w-6 rounded-full bg-gradient-to-br from-[#e5ff47] to-amber-500 shadow-lg shadow-amber-500/30"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>

                  {/* Content side */}
                  <div className={`flex-1 ${isLeft ? 'lg:pr-12 lg:text-right' : 'lg:pl-12'}`}>
                    <motion.div
                      initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="inline-flex flex-col items-start gap-3"
                    >
                      <div className="relative">
                        <motion.div
                          className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl shadow-xl"
                          style={{
                            background: `linear-gradient(135deg, #1e293b, #0f172a)`,
                          }}
                          whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
                          transition={{ duration: 0.3 }}
                        >
                          <step.icon className="h-8 w-8 sm:h-10 sm:w-10 text-[#e5ff47]" />
                        </motion.div>
                        <motion.div
                          className="absolute -top-2 -right-2 h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg"
                          style={{
                            background: `linear-gradient(135deg, ${step.gradient.replace('from-', '').split(' ')[0].trim()})`,
                          }}
                          animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                        >
                          {index + 1}
                        </motion.div>
                      </div>

                      <div>
                        <motion.h3
                          className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2"
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 }}
                        >
                          {step.title}
                        </motion.h3>
                        <motion.p
                          className="text-gray-600 dark:text-gray-400 max-w-md"
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 }}
                        >
                          {step.description}
                        </motion.p>
                        <motion.div
                          className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                          style={{
                            background: `${step.gradient.replace('from-', '').trim()}15`,
                            color: step.gradient.includes('blue') ? '#2563EB' : step.gradient.includes('purple') ? '#7C3AED' : step.gradient.includes('emerald') ? '#059669' : '#EA580C',
                          }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4, type: 'spring' }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          {step.highlight}
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Visual side */}
                  <div className={`flex-1 w-full ${isLeft ? '' : 'lg:order-first'}`}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.85, y: 20 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      className="relative h-48 sm:h-56 rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" />
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        animate={{ opacity: [1, 0.8, 1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        <VisualComponent />
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Link
            to="/tool"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e5ff47] to-amber-400 text-[#0a0a0a] font-semibold px-8 py-4 shadow-lg hover:shadow-xl hover:from-amber-400 hover:to-[#e5ff47] transition-all duration-300"
          >
            Try it now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
