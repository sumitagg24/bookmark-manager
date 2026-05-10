/**
 * Health Check Dashboard UI
 * Real-time display of feature health and test status
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { type Feature, type FeatureCategory, globalRegistry } from '../core/featureRegistry';

interface HealthDashboardProps {
  onRunTests?: (featureId?: string) => void;
  onViewDetails?: (featureId: string) => void;
}

export const HealthDashboard: React.FC<HealthDashboardProps> = ({
  onRunTests,
  onViewDetails,
}) => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [filter, setFilter] = useState<FeatureCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'lastTested'>('name');
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setFeatures(globalRegistry.getAll());
  }, []);

  const filteredFeatures =
    filter === 'all'
      ? features
      : features.filter((f) => f.category === filter);

  const sortedFeatures = [...filteredFeatures].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'status':
        return a.testStatus.localeCompare(b.testStatus);
      case 'lastTested':
        return (b.lastTested?.getTime() || 0) - (a.lastTested?.getTime() || 0);
      default:
        return 0;
    }
  });

  const passCount = features.filter((f) => f.testStatus === 'passing').length;
  const failCount = features.filter((f) => f.testStatus === 'failing').length;
  const passRate = features.length > 0 ? Math.round((passCount / features.length) * 100) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passing':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failing':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'flaky':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passing':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failing':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'flaky':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Overview Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Total Features
          </div>
          <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {features.length}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Pass Rate
          </div>
          <div className="mt-2 text-3xl font-bold text-green-600">{passRate}%</div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Passing
          </div>
          <div className="mt-2 text-3xl font-bold text-green-600">{passCount}</div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Failing
          </div>
          <div className="mt-2 text-3xl font-bold text-red-600">{failCount}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FeatureCategory | 'all')}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
          >
            <option value="all">All Categories</option>
            <option value="file-upload">File Upload</option>
            <option value="merge-dedup">Merge & Dedup</option>
            <option value="edit">Edit</option>
            <option value="search">Search</option>
            <option value="bulk-actions">Bulk Actions</option>
            <option value="link-health">Link Health</option>
            <option value="auto-organize">Auto-Organize</option>
            <option value="export">Export</option>
            <option value="theme">Theme</option>
            <option value="session">Session</option>
            <option value="keyboard">Keyboard</option>
            <option value="drag-drop">Drag & Drop</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'status' | 'lastTested')}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
          >
            <option value="name">Sort by Name</option>
            <option value="status">Sort by Status</option>
            <option value="lastTested">Sort by Last Tested</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsRunning(true);
              onRunTests?.();
              setTimeout(() => setIsRunning(false), 2000);
            }}
            disabled={isRunning}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isRunning ? 'Running...' : 'Run All Tests'}
          </button>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="space-y-2">
        {sortedFeatures.map((feature) => (
          <div
            key={feature.id}
            className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(feature.testStatus)}
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {feature.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(feature.testStatus)}`}>
                  {feature.testStatus}
                </span>

                <button
                  onClick={() => {
                    setExpandedFeature(expandedFeature === feature.id ? null : feature.id);
                    onViewDetails?.(feature.id);
                  }}
                  className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20"
                >
                  {expandedFeature === feature.id ? 'Hide' : 'Details'}
                </button>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedFeature === feature.id && (
              <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 dark:border-white/10">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Requirements
                  </h4>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {feature.requirements.map((req) => (
                      <span
                        key={req}
                        className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-white/10 dark:text-slate-300"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>

                {feature.buttons.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Buttons
                    </h4>
                    <div className="mt-1 space-y-1">
                      {feature.buttons.map((button) => (
                        <div
                          key={button.id}
                          className="text-sm text-slate-600 dark:text-slate-400"
                        >
                          <span className="font-medium">{button.label}</span>
                          {' - '}
                          {button.expectedAction}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {feature.lastTested && (
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Last tested: {feature.lastTested.toLocaleString()}
                  </div>
                )}

                <button
                  onClick={() => {
                    setIsRunning(true);
                    onRunTests?.(feature.id);
                    setTimeout(() => setIsRunning(false), 2000);
                  }}
                  disabled={isRunning}
                  className="rounded-lg bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {isRunning ? 'Running...' : 'Run Feature Tests'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
