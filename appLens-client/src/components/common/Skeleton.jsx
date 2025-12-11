import { motion } from 'motion/react';

/**
 * Skeleton loader component for dashboard loading states
 * @param {Object} props
 * @param {'cards' | 'table' | 'list' | 'stats'} props.type - Type of skeleton to render
 * @param {number} props.count - Number of skeleton items (default: 3)
 */
function Skeleton({ type = 'cards', count = 3 }) {
  // Staggered animation for skeleton items
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Card skeleton
  const CardSkeleton = ({ index }) => (
    <motion.div
      key={index}
      variants={itemVariants}
      className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-6 space-y-4"
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 bg-slate-300 dark:bg-slate-700 rounded-lg animate-pulse" />
        <div className="h-8 w-8 bg-slate-300 dark:bg-slate-700 rounded-lg animate-pulse" />
      </div>
      
      {/* Title */}
      <div className="h-8 w-32 bg-slate-300 dark:bg-slate-700 rounded-lg animate-pulse" />
      
      {/* Subtitle / description */}
      <div className="space-y-2">
        <div className="h-3 w-full bg-slate-300 dark:bg-slate-700 rounded animate-pulse" />
        <div className="h-3 w-3/4 bg-slate-300 dark:bg-slate-700 rounded animate-pulse" />
      </div>
      
      {/* Footer */}
      <div className="flex items-center gap-2 pt-2">
        <div className="h-3 w-16 bg-slate-300 dark:bg-slate-700 rounded animate-pulse" />
        <div className="h-3 w-3 bg-slate-300 dark:bg-slate-700 rounded-full animate-pulse" />
        <div className="h-3 w-20 bg-slate-300 dark:bg-slate-700 rounded animate-pulse" />
      </div>
    </motion.div>
  );

  // Table skeleton
  const TableSkeleton = () => (
    <motion.div
      variants={itemVariants}
      className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden"
    >
      {/* Table header */}
      <div className="bg-slate-100 dark:bg-slate-900 px-6 py-4 border-b border-slate-300 dark:border-slate-700">
        <div className="flex items-center gap-6">
          <div className="h-4 w-8 bg-slate-300 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-4 w-32 bg-slate-300 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-4 w-24 bg-slate-300 dark:bg-slate-700 rounded animate-pulse hidden sm:block" />
          <div className="h-4 w-20 bg-slate-300 dark:bg-slate-700 rounded animate-pulse hidden md:block" />
          <div className="h-4 w-16 bg-slate-300 dark:bg-slate-700 rounded animate-pulse hidden lg:block" />
          <div className="h-4 w-20 bg-slate-300 dark:bg-slate-700 rounded animate-pulse ml-auto" />
        </div>
      </div>
      
      {/* Table rows */}
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`px-6 py-4 flex items-center gap-6 ${
            index !== count - 1 ? 'border-b border-slate-300 dark:border-slate-700' : ''
          }`}
        >
          <div className="h-4 w-4 bg-slate-300 dark:bg-slate-700 rounded animate-pulse" />
          <div className="flex items-center gap-3 flex-1">
            <div className="h-10 w-10 bg-slate-300 dark:bg-slate-700 rounded-lg animate-pulse shrink-0" />
            <div className="space-y-2 flex-1 min-w-0">
              <div className="h-4 w-40 bg-slate-300 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-3 w-24 bg-slate-300 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-6 w-16 bg-slate-300 dark:bg-slate-700 rounded-full animate-pulse hidden sm:block" />
          <div className="h-4 w-20 bg-slate-300 dark:bg-slate-700 rounded animate-pulse hidden md:block" />
          <div className="h-4 w-24 bg-slate-300 dark:bg-slate-700 rounded animate-pulse hidden lg:block" />
          <div className="h-8 w-8 bg-slate-300 dark:bg-slate-700 rounded-lg animate-pulse" />
        </div>
      ))}
    </motion.div>
  );

  // List skeleton
  const ListSkeleton = ({ index }) => (
    <motion.div
      key={index}
      variants={itemVariants}
      className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-4 flex items-center gap-4"
    >
      {/* Icon */}
      <div className="h-12 w-12 bg-slate-300 dark:bg-slate-700 rounded-xl animate-pulse shrink-0" />
      
      {/* Content */}
      <div className="flex-1 space-y-2 min-w-0">
        <div className="h-4 w-48 bg-slate-300 dark:bg-slate-700 rounded animate-pulse" />
        <div className="h-3 w-32 bg-slate-300 dark:bg-slate-700 rounded animate-pulse" />
      </div>
      
      {/* Action */}
      <div className="h-8 w-20 bg-slate-300 dark:bg-slate-700 rounded-lg animate-pulse shrink-0" />
    </motion.div>
  );

  // Stats skeleton (for dashboard stats cards)
  const StatsSkeleton = ({ index }) => (
    <motion.div
      key={index}
      variants={itemVariants}
      className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-6"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="h-3 w-20 bg-slate-300 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-8 w-16 bg-slate-300 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-slate-300 dark:bg-slate-700 rounded-full animate-pulse" />
            <div className="h-3 w-24 bg-slate-300 dark:bg-slate-700 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-12 w-12 bg-slate-300 dark:bg-slate-700 rounded-xl animate-pulse" />
      </div>
    </motion.div>
  );

  // Render based on type
  const renderSkeletons = () => {
    switch (type) {
      case 'cards':
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {Array.from({ length: count }).map((_, index) => (
              <CardSkeleton key={index} index={index} />
            ))}
          </motion.div>
        );

      case 'table':
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <TableSkeleton />
          </motion.div>
        );

      case 'list':
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {Array.from({ length: count }).map((_, index) => (
              <ListSkeleton key={index} index={index} />
            ))}
          </motion.div>
        );

      case 'stats':
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {Array.from({ length: count }).map((_, index) => (
              <StatsSkeleton key={index} index={index} />
            ))}
          </motion.div>
        );

      default:
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {Array.from({ length: count }).map((_, index) => (
              <CardSkeleton key={index} index={index} />
            ))}
          </motion.div>
        );
    }
  };

  return renderSkeletons();
}

// Individual skeleton components for more granular use
export const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-6 space-y-4 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="h-4 w-24 bg-slate-300 dark:bg-slate-700 rounded-lg" />
      <div className="h-8 w-8 bg-slate-300 dark:bg-slate-700 rounded-lg" />
    </div>
    <div className="h-8 w-32 bg-slate-300 dark:bg-slate-700 rounded-lg" />
    <div className="space-y-2">
      <div className="h-3 w-full bg-slate-300 dark:bg-slate-700 rounded" />
      <div className="h-3 w-3/4 bg-slate-300 dark:bg-slate-700 rounded" />
    </div>
  </div>
);

export const SkeletonText = ({ width = 'w-full', height = 'h-4' }) => (
  <div className={`${width} ${height} bg-slate-300 dark:bg-slate-700 rounded animate-pulse`} />
);

export const SkeletonCircle = ({ size = 'w-10 h-10' }) => (
  <div className={`${size} bg-slate-300 dark:bg-slate-700 rounded-full animate-pulse`} />
);

export const SkeletonButton = ({ width = 'w-24' }) => (
  <div className={`${width} h-10 bg-slate-300 dark:bg-slate-700 rounded-lg animate-pulse`} />
);

export default Skeleton;
