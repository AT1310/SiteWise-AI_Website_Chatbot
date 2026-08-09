import { motion, AnimatePresence } from 'framer-motion';
import { HiCheck, HiMiniArrowPath, HiExclamationTriangle } from 'react-icons/hi2';
import type { CrawlStep } from '../../types/api';
import type { CrawlResponse } from '../../types/api';
import { formatDuration } from '../../utils/formatters';

interface CrawlProgressProps {
  steps: CrawlStep[];
  result: CrawlResponse | null;
}

export default function CrawlProgress({ steps, result }: CrawlProgressProps) {
  return (
    <motion.div
      className="w-full max-w-lg mx-auto mt-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Steps */}
      <div className="glass rounded-2xl p-6 space-y-3">
        <AnimatePresence>
          {steps.map((step, index) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                {step.status === 'done' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 rounded-full bg-[#00d2a0]/20 flex items-center justify-center"
                  >
                    <HiCheck className="w-3.5 h-3.5 text-[#00d2a0]" />
                  </motion.div>
                )}
                {step.status === 'active' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-6 h-6 rounded-full bg-[#6c5ce7]/20 flex items-center justify-center"
                  >
                    <HiMiniArrowPath className="w-3.5 h-3.5 text-[#6c5ce7]" />
                  </motion.div>
                )}
                {step.status === 'pending' && (
                  <div className="w-6 h-6 rounded-full bg-[#1a1a2e] border border-[rgba(255,255,255,0.08)] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#55556a]" />
                  </div>
                )}
                {step.status === 'error' && (
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                    <HiExclamationTriangle className="w-3.5 h-3.5 text-red-400" />
                  </div>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-sm ${
                  step.status === 'done'
                    ? 'text-[#f0f0f5]'
                    : step.status === 'active'
                    ? 'text-[#6c5ce7] font-medium'
                    : step.status === 'error'
                    ? 'text-red-400'
                    : 'text-[#55556a]'
                }`}
              >
                {step.label}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Stats — shown after crawl completes */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-3 mt-4"
        >
          <StatCard label="Pages Crawled" value={result.pages_crawled} />
          <StatCard label="Documents" value={result.documents_processed} />
          <StatCard label="Chunks Created" value={result.chunks_created} />
          <StatCard label="Time Taken" value={formatDuration(result.time_taken)} />
          <StatCard
            label="Strategy"
            value={result.crawl_strategy === 'llms_txt' ? 'LLMs.txt' : 'BFS Crawl'}
            className="col-span-2"
          />
        </motion.div>
      )}
    </motion.div>
  );
}

function StatCard({
  label,
  value,
  className = '',
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div className={`glass rounded-xl p-4 text-center ${className}`}>
      <p className="text-xs text-[#8888a0] mb-1">{label}</p>
      <p className="text-lg font-bold text-[#f0f0f5]">{value}</p>
    </div>
  );
}
