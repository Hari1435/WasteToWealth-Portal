import React from 'react';

const SkeletonLoader = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
};

// Dashboard skeleton loader
export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 lg:mb-8">
        <div className="mb-4 lg:mb-0">
          <SkeletonLoader className="h-8 w-64 mb-2" />
          <SkeletonLoader className="h-4 w-96" />
        </div>
        <div className="flex gap-3">
          <SkeletonLoader className="h-10 w-32" />
          <SkeletonLoader className="h-10 w-24" />
        </div>
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <SkeletonLoader className="h-4 w-20 mb-2" />
                <SkeletonLoader className="h-8 w-16 mb-2" />
                <SkeletonLoader className="h-3 w-24" />
              </div>
              <SkeletonLoader className="w-12 h-12 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Content sections skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <SkeletonLoader className="h-6 w-32" />
                <SkeletonLoader className="h-4 w-16" />
              </div>
            </div>
            <div className="p-6 space-y-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <SkeletonLoader className="w-10 h-10 rounded-lg" />
                    <div>
                      <SkeletonLoader className="h-4 w-32 mb-1" />
                      <SkeletonLoader className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="text-right">
                    <SkeletonLoader className="h-4 w-16 mb-1" />
                    <SkeletonLoader className="h-3 w-12" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Listings skeleton loader
export const ListingsSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Search bar skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <SkeletonLoader className="flex-1 h-10" />
          <div className="flex gap-2">
            <SkeletonLoader className="h-10 w-20" />
            <SkeletonLoader className="h-10 w-20" />
          </div>
        </div>
      </div>

      {/* Listings grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <SkeletonLoader className="h-48 w-full" />
            <div className="p-6">
              <SkeletonLoader className="h-6 w-3/4 mb-2" />
              <div className="space-y-2 mb-4">
                <SkeletonLoader className="h-4 w-full" />
                <SkeletonLoader className="h-4 w-full" />
                <SkeletonLoader className="h-4 w-2/3" />
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <SkeletonLoader className="h-6 w-20" />
                <div className="flex space-x-2">
                  <SkeletonLoader className="h-8 w-16" />
                  <SkeletonLoader className="h-8 w-16" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Form skeleton loader
export const FormSkeleton = () => {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <SkeletonLoader className="h-8 w-64 mb-2" />
        <SkeletonLoader className="h-4 w-96" />
      </div>

      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <SkeletonLoader className="w-8 h-8 rounded-lg mr-3" />
            <SkeletonLoader className="h-6 w-40" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j}>
                <SkeletonLoader className="h-4 w-24 mb-2" />
                <SkeletonLoader className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end space-x-4">
        <SkeletonLoader className="h-10 w-20" />
        <SkeletonLoader className="h-10 w-32" />
      </div>
    </div>
  );
};

export default SkeletonLoader;