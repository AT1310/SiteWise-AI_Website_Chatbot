import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useWebsite } from '../contexts/WebsiteContext';
import BrowserBar from '../components/layout/BrowserBar';
import WebsiteViewer from '../components/viewer/WebsiteViewer';
import AiWidget from '../components/widget/AiWidget';

export default function WebsitePage() {
  const { crawlData } = useWebsite();
  const navigate = useNavigate();

  // Redirect to home if no crawl data — user navigated directly to /website
  useEffect(() => {
    if (!crawlData) {
      navigate('/', { replace: true });
    }
  }, [crawlData, navigate]);

  if (!crawlData) return null;

  return (
    <div className="h-full flex flex-col">
      {/* Browser Bar */}
      <BrowserBar title={crawlData.website_title} url={crawlData.website_url} />

      {/* Website Viewer */}
      <div className="flex-1 overflow-hidden">
        <WebsiteViewer url={crawlData.website_url} title={crawlData.website_title} />
      </div>

      {/* Floating AI Widget */}
      <AiWidget websiteTitle={crawlData.website_title} />
    </div>
  );
}
