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
        (f) => {
          // Check file size (max 50MB)
          if (f.size > 50 * 1024 * 1024) {
            alert(`File "${f.name}" is too large (max 50MB)`);
            return false;
          }
          return f.name.endsWith('.html') || f.name.endsWith('.htm') || f.name.endsWith('.json');
        }
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
               : 'border-slate-200/90 bg-premium-mist/80 hover:border-premium-orange/35 hover:shadow-premium-sm dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-premium-orange/40'
           }
           ${isProcessing ? 'cursor-not-allowed opacity-50' : ''}
         `}
       >
         <input {...getInputProps()} />

         <motion.div
           initial={false}
           animate={isDragActive ? { scale: 1.06, y: -5 } : { scale: 1, y: 0 }}
           transition={{ type: 'spring', stiffness: 300, damping: 20 }}
           className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-3xl bg-gradient-to-br from-premium-orange/15 to-premium-orange/5 shadow-premium-sm border border-premium-orange/20"
         >
           <Upload className="h-9 w-9 text-premium-orange" strokeWidth={1.5} />
         </motion.div>

         <motion.p
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="text-xl font-bold tracking-tight text-slate-900 dark:text-white"
         >
           {isDragActive ? 'Drop to import' : 'Drag & drop bookmark files'}
         </motion.p>
         <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-slate-500 dark:text-slate-400">
           Chrome HTML, Firefox HTML, or Chrome JSON exports
         </p>
         <motion.button
           type="button"
           whileHover={{ scale: 1.03 }}
           whileTap={{ scale: 0.98 }}
           className="btn-primary mt-6 shadow-premium-btn"
           onClick={(e) => {
             e.stopPropagation();
             if (!isProcessing) open();
           }}
         >
           Browse files
         </motion.button>
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
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-premium-orange/10 to-premium-orange/5 border border-premium-orange/20">
                <FileText className="h-5 w-5 text-premium-orange" strokeWidth={1.75} />
              </div>
              Imported files ({files.length})
            </h3>

            <div className="space-y-3">
              {files.map((file) => {
                return (
                  <motion.div
                    key={file.id}
                    layout
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-100/50 bg-white px-4 py-3.5 shadow-premium-sm transition-all hover:border-slate-200/70 hover:shadow-lg dark:border-white/[0.06] dark:bg-white/[0.04] dark:hover:border-white/[0.1]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {file.format === 'chrome-json' ? (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border border-teal-200/50 dark:border-teal-800/30">
                          <FileJson className="h-5 w-5 shrink-0 text-teal-600 dark:text-cyan-400" />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-premium-orange/10 to-premium-orange/5 border border-premium-orange/20">
                          <FileText className="h-5 w-5 shrink-0 text-premium-orange" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900 dark:text-white group-hover:text-premium-orange transition-colors">
                          {file.filename}
                        </p>
                        <div className="flex items-center gap-2 text-[12px] text-slate-500 dark:text-slate-400">
                          <span>{file.stats.totalBookmarks} bookmarks</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                          <span>{file.stats.totalFolders} folders</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                          <span className="capitalize">{file.format.replace('-', ' ')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="shrink-0 rounded-xl p-2 text-slate-400 transition-all hover:bg-red-50 hover:text-red-600 hover:scale-110 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                        aria-label="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
