import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, CheckCircle, FolderTree, Download, ArrowRight, ArrowLeft } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description: string;
  icon: typeof Upload;
}

const steps: Step[] = [
  {
    id: 'import',
    title: 'Import Your Bookmarks',
    description: 'Drag & drop HTML or JSON bookmark files from your browser. Supports Chrome, Firefox, Safari, and Edge exports.',
    icon: Upload,
  },
  {
    id: 'review',
    title: 'Review & Clean',
    description: 'Duplicates are automatically removed. Browse your merged bookmarks, edit titles/URLs, and organize folders.',
    icon: CheckCircle,
  },
  {
    id: 'export',
    title: 'Export Clean Bookmarks',
    description: 'Download your cleaned bookmarks as HTML, CSV, plain URLs, or Markdown format.',
    icon: Download,
  },
];

interface OnboardingGuideProps {
   hasFiles: boolean;
   onClose: () => void;
}

export function OnboardingGuide({ hasFiles: _hasFiles, onClose }: OnboardingGuideProps) {
   const [currentStep, setCurrentStep] = useState(0);
   const [isVisible, setIsVisible] = useState(true);

   const handleClose = () => {
     setIsVisible(false);
     onClose();
   };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-6 right-6 z-50 w-80 premium-card p-5 shadow-2xl"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-premium-orange/10 flex items-center justify-center">
                <FolderTree className="h-5 w-5 text-premium-orange" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Quick Guide</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Step {currentStep + 1} of {steps.length}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
              aria-label="Close guide"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 dark:text-white">{steps[currentStep].title}</h4>
            <p className="text-[13px] text-slate-600 dark:text-slate-400">{steps[currentStep].description}</p>
          </div>

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-200/60 dark:border-white/10">
            <div className="flex gap-1">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === currentStep ? 'bg-premium-orange' : 'bg-slate-300 dark:bg-white/20'
                  }`}
                  aria-label={`Go to step ${idx + 1}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="btn-secondary py-1.5 px-3 text-[12px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-3 w-3" />
              </button>
              <button
                onClick={nextStep}
                disabled={currentStep === steps.length - 1}
                className="btn-secondary py-1.5 px-3 text-[12px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}