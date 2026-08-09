import { motion } from 'framer-motion';
import { HiGlobeAlt, HiArrowTopRightOnSquare } from 'react-icons/hi2';

interface ReaderViewProps {
  url: string;
  title: string;
}

export default function ReaderView({ url, title }: ReaderViewProps) {
  return (
    <motion.div
      className="h-full flex flex-col items-center justify-center p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="glass rounded-2xl p-10 max-w-lg w-full text-center">
        {/* Globe icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6c5ce7]/20 to-[#a78bfa]/20 flex items-center justify-center mx-auto mb-6">
          <HiGlobeAlt className="w-8 h-8 text-[#6c5ce7]" />
        </div>

        <h2 className="text-xl font-bold text-[#f0f0f5] mb-2">{title}</h2>

        <p className="text-sm text-[#8888a0] mb-6 leading-relaxed">
          This website blocks embedded viewing. But don&apos;t worry — the content has
          been fully indexed and the AI assistant is ready to answer your questions.
        </p>

        <p className="text-xs text-[#55556a] mb-6">
          Click the <span className="text-[#6c5ce7] font-medium">AI button</span> in
          the bottom-right corner to start chatting.
        </p>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)] transition-colors text-sm text-[#f0f0f5] border border-[rgba(255,255,255,0.08)]"
        >
          <HiArrowTopRightOnSquare className="w-4 h-4" />
          Open in new tab
        </a>
      </div>
    </motion.div>
  );
}
