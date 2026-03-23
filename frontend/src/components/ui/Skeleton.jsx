import React from 'react';

/**
 * Skeleton Component - Loading placeholder
 * @param {string} className - Tailwind classes for size/shape
 */
export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`} />
);

/**
 * KPI Skeleton
 */
export const KPISkeleton = () => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-3 shadow-sm">
    <div className="flex justify-between items-start">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-8 rounded-lg" />
    </div>
    <Skeleton className="h-8 w-16" />
    <Skeleton className="h-2 w-full" />
  </div>
);

/**
 * Table Skeleton
 * @param {number} rows - Number of rows
 */
export const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-4">
    <div className="flex justify-between">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 border-b border-gray-100 dark:border-gray-700 flex gap-4">
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 w-20" />
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="p-4 border-b border-gray-50 dark:border-gray-800 flex gap-4 last:border-0 items-center">
          <Skeleton className="h-6 flex-1" />
          <Skeleton className="h-6 flex-1" />
          <Skeleton className="h-6 flex-1" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);
