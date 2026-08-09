import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiGlobeAlt } from 'react-icons/hi2';
import Logo from '../components/common/Logo';
import GlowButton from '../components/common/GlowButton';
import CrawlProgress from '../components/common/CrawlProgress';
import { useWebsite } from '../contexts/WebsiteContext';
import { crawlWebsite } from '../services/api';
import type { CrawlStep, CrawlResponse } from '../types/api';

const INITIAL_STEPS: CrawlStep[] = [
  { label: 'Detecting crawl strategy', status: 'pending' },
  { label: 'Crawling website', status: 'pending' },
  { label: 'Processing documents', status: 'pending' },
  { label: 'Chunking content', status: 'pending' },
  { label: 'Creating embeddings', status: 'pending' },
  { label: 'Building vector store', status: 'pending' },
  { label: 'Ready', status: 'pending' },
];

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [isCrawling, setIsCrawling] = useState(false);
  const [steps, setSteps] = useState<CrawlStep[]>(INITIAL_STEPS);
  const [crawlResult, setCrawlResult] = useState<CrawlResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { setCrawlData } = useWebsite();
  const navigate = useNavigate();

  // Simulate step progression — backend doesn't stream progress, so we
  // animate steps on a timer while waiting for the single /crawl response
  const simulateSteps = () => {
    const stepDelays = [300, 2000, 4000, 6000, 8000, 10000];
    stepDelays.forEach((delay, i) => {
      setTimeout(() => {
        setSteps(prev =>
          prev.map((step, idx) => {
            if (idx < i) return { ...step, status: 'done' };
            if (idx === i) return { ...step, status: 'active' };
            return step;
          })
        );
      }, delay);
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isCrawling) return;

    setIsCrawling(true);
    setError(null);
    setCrawlResult(null);
    setSteps(INITIAL_STEPS);

    simulateSteps();

    try {
      const result = await crawlWebsite(url.trim());

      // Mark all steps done
      setSteps(prev => prev.map(step => ({ ...step, status: 'done' as const })));
      setCrawlResult(result);
      setCrawlData(result);

      // Navigate to viewer after a short delay to show stats
      setTimeout(() => navigate('/website'), 2000);
    } catch (err) {
      setSteps(prev =>
        prev.map(step =>
          step.status === 'active'
            ? { ...step, status: 'error' as const }
            : step.status === 'pending'
            ? step
            : step
        )
      );
      const message =
        err instanceof Error ? err.message : 'Failed to crawl website. Please try again.';
      setError(message);
      setIsCrawling(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6c5ce7] rounded-full opacity-[0.03] blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#a78bfa] rounded-full opacity-[0.03] blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-xl flex flex-col items-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <Logo size="lg" />
        </motion.div>

        {/* URL Input Form */}
        {!isCrawling && (
          <motion.form
            onSubmit={handleSubmit}
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="glass rounded-2xl p-2 flex items-center gap-2">
              <div className="flex items-center gap-3 flex-1 px-4">
                <HiGlobeAlt className="text-[#8888a0] text-lg flex-shrink-0" />
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://react.dev"
                  required
                  className="flex-1 bg-transparent border-none outline-none text-[#f0f0f5] placeholder-[#55556a] text-sm py-3"
                />
              </div>
              <GlowButton type="submit" disabled={!url.trim()}>
                Open AI Website
              </GlowButton>
            </div>

            {/* Example sites */}
            <motion.div
              className="flex flex-wrap items-center justify-center gap-2 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <span className="text-xs text-[#55556a]">Try:</span>
              {['https://react.dev', 'https://docs.python.org', 'https://fastapi.tiangolo.com'].map(
                example => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setUrl(example)}
                    className="text-xs text-[#8888a0] hover:text-[#6c5ce7] transition-colors px-2.5 py-1 rounded-lg border border-[rgba(255,255,255,0.06)] hover:border-[rgba(108,92,231,0.3)] cursor-pointer"
                  >
                    {new URL(example).hostname}
                  </button>
                )
              )}
            </motion.div>
          </motion.form>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 glass rounded-xl p-4 border-red-500/30 text-red-400 text-sm text-center w-full"
          >
            {error}
          </motion.div>
        )}

        {/* Crawl Progress */}
        {isCrawling && <CrawlProgress steps={steps} result={crawlResult} />}
      </div>
    </div>
  );
}
