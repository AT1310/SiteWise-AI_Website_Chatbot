import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowLeft, HiCheckCircle, HiArrowTopRightOnSquare } from 'react-icons/hi2';
import Logo from '../common/Logo';
import { truncate } from '../../utils/formatters';

interface BrowserBarProps {
  title: string;
  url: string;
}

export default function BrowserBar({ title, url }: BrowserBarProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      className="glass border-b border-[rgba(255,255,255,0.06)] px-4 py-3 flex items-center gap-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.06)] transition-colors text-[#8888a0] hover:text-[#f0f0f5] cursor-pointer"
        title="Go back"
      >
        <HiArrowLeft className="w-4 h-4" />
      </button>

      {/* Logo */}
      <Logo size="sm" />

      {/* URL bar */}
      <div className="flex-1 flex items-center gap-2 bg-[#0a0a0f] rounded-lg px-4 py-2 border border-[rgba(255,255,255,0.06)]">
        <HiCheckCircle className="w-4 h-4 text-[#00d2a0] flex-shrink-0" />
        <span className="text-sm text-[#8888a0] truncate">{truncate(url, 70)}</span>
      </div>

      {/* Title */}
      <span className="text-sm font-medium text-[#f0f0f5] hidden md:block max-w-[200px] truncate">
        {title}
      </span>

      {/* Status badge */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00d2a0]/10 border border-[#00d2a0]/20">
        <div className="w-1.5 h-1.5 rounded-full bg-[#00d2a0]" />
        <span className="text-xs font-medium text-[#00d2a0]">Indexed</span>
      </div>

      {/* Open original */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.06)] transition-colors text-[#8888a0] hover:text-[#f0f0f5]"
        title="Open original website"
      >
        <HiArrowTopRightOnSquare className="w-4 h-4" />
      </a>
    </motion.div>
  );
}
