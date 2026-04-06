import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, FileJson } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookmarkStore } from '../store/bookmarkStore';

export const FileUpload: React.FC = () => {
  const { files, addFiles, removeFile, isProcessing } = useBookmarkStore();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const validFiles = acceptedFiles.filter(
        (f) =>
          f.name.endsWith('.html') || f.name.endsWith('.htm') || f.name.endsWith('.json')
      );
      if (validFiles.length > 0) {
        addFiles(validFiles);
      }
    },
    [addFiles]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'text/html': ['.html', '.htm'],
      'application/json': ['.json'],
    },
    disabled: isProcessing,
  });

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`
          relative cursor-pointer overflow-hidden rounded-[28px] border-2 border-dashed p-10 text-center transition-all duration-300 md:p-12
          ${
            isDragActive
              ? 'border-premium-orange/60 bg-premium-orange-soft shadow-premium-sm dark:border-premium-orange dark:bg-premium-orange/10'
              : 'border-slate-200/90 bg-premium-mist/80 hover:border-premium-orange/35 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-premium-orange/40'
          }
          ${isProcessing ? 'cursor-not-allowed opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />

        <motion.div
          initial={false}
          animate={isDragActive ? { scale: 1.06 } : { scale: 1 }}
          className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-3xl bg-white shadow-premium-sm dark:bg-white/10"
        >
          <Upload className="h-9 w-9 text-premium-orange" strokeWidth={1.5} />
        </motion.div>

        <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          {isDragActive ? 'Drop to import' : 'Drag & drop bookmark files'}
        </p>
        <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-slate-500 dark:text-slate-400">
          Chrome HTML, Firefox HTML, or Chrome JSON exports
        </p>
        <button
          type="button"
          className="btn-secondary mt-6"
          onClick={(e) => {
            e.stopPropagation();
            if (!isProcessing) open();
          }}
        >
          Browse files
        </button>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="premium-card p-6 md:p-8"
          >
            <h3 className="mb-5 flex items-center gap-3 text-lg font-bold text-slate-900 dark:text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-premium-orange/10">
                <FileText className="h-5 w-5 text-premium-orange" strokeWidth={1.75} />
              </span>
              Imported files ({files.length})
            </h3>

            <div className="space-y-3">
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 shadow-premium-sm dark:border-white/[0.06] dark:bg-white/[0.04]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {file.format === 'chrome-json' ? (
                      <FileJson className="h-5 w-5 shrink-0 text-premium-teal-deep dark:text-cyan-400" />
                    ) : (
                      <FileText className="h-5 w-5 shrink-0 text-premium-orange" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900 dark:text-white">
                        {file.filename}
                      </p>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400">
                        {file.stats.totalBookmarks} bookmarks · {file.stats.totalFolders} folders ·{' '}
                        {file.format}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    className="shrink-0 rounded-xl p-2.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
