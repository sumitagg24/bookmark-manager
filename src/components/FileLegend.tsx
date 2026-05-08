import { useMemo } from 'react';
import { useBookmarkStore } from '../store/bookmarkStore';

export function getFileColor(filename: string): string {
  let hash = 0;
  for (let i = 0; i < filename.length; i++) {
    hash = filename.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
    '#14B8A6', '#F97316', '#8B5CF6', '#06B6D4',
  ];
  return colors[Math.abs(hash) % colors.length];
}

export function getFileColorsMap(files: string[]): Map<string, { bg: string; text: string; border: string }> {
  const colors = new Map<string, { bg: string; text: string; border: string }>();
  files.forEach((file) => {
    const color = getFileColor(file);
    colors.set(file, {
      bg: `${color}15`,
      text: color,
      border: `${color}40`,
    });
  });
  return colors;
}

export function FileLegend() {
  const { mergeResult } = useBookmarkStore();

  const fileColors = useMemo(() => {
    if (!mergeResult || mergeResult.sourceFiles.length <= 1) return new Map();
    return getFileColorsMap(mergeResult.sourceFiles);
  }, [mergeResult]);

  if (!mergeResult || mergeResult.sourceFiles.length <= 1) return null;

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Sources:</span>
      {Array.from(mergeResult.sourceFiles).map((file) => {
        const colors = fileColors.get(file);
        if (!colors) return null;
        return (
          <span
            key={file}
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium border"
            style={{
              backgroundColor: colors.bg,
              color: colors.text,
              borderColor: colors.border,
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: colors.text }}
            />
            {file.split('/').pop()?.replace('.html', '').replace('.json', '') || file}
          </span>
        );
      })}
    </div>
  );
}
