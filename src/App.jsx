import { useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import HomeView from './views/HomeView';
import CardView from './views/CardView';
import ProgrammesView from './views/ProgrammesView';
import PerksView from './views/PerksView';

const DEFAULT_MEMBER_NO = '859';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [prevTab, setPrevTab] = useState('home');
  const [memberNo, setMemberNo] = useState(DEFAULT_MEMBER_NO);
  const [copied, setCopied] = useState(false);
  const [notifOn, setNotifOn] = useState(true);
  const [toast, setToast] = useState(null);
  const scrollRef = useRef(null);

  // Load a persisted member number, falling back to the default.
  useEffect(() => {
    try {
      const stored =
        localStorage.getItem('collective_member_number') ||
        localStorage.getItem('member_number') ||
        DEFAULT_MEMBER_NO;
      setMemberNo(stored.replace(/\D/g, '').slice(0, 4) || DEFAULT_MEMBER_NO);
    } catch {
      setMemberNo(DEFAULT_MEMBER_NO);
    }
  }, []);

  const showToast = (message, duration = 2200) => {
    setToast(message);
    setTimeout(() => setToast(null), duration);
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigate = (tab) => {
    if (tab === activeTab) {
      scrollToTop();
      showToast(tab === 'home' ? 'Already on Home' : `You are on ${tab}`, 1500);
      return;
    }
    setPrevTab(activeTab);
    setActiveTab(tab);
    scrollToTop();
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText('COLLECTIVE15');
    } catch {
      // Clipboard may be unavailable (unsupported browser, no permission, etc).
    }
    setCopied(true);
    setToast('Code COLLECTIVE15 copied');
    setTimeout(() => setToast(null), 2000);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen w-full bg-[#EDEDED] flex justify-center selection:bg-black selection:text-white overflow-x-hidden">
      <div className="w-full max-w-[480px] min-h-screen bg-white relative flex flex-col shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_20px_80px_rgba(0,0,0,0.12)] overflow-hidden overflow-x-hidden">
        <Header memberNo={memberNo} />

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none relative bg-white"
        >
          <div
            key={activeTab}
            className="min-h-full"
            style={{
              animation: `${prevTab !== activeTab ? 'slideUp' : 'fadeIn'} 0.38s cubic-bezier(0.16,1,0.3,1)`,
            }}
          >
            {activeTab === 'home' && <HomeView memberNo={memberNo} onAction={showToast} />}
            {activeTab === 'card' && <CardView memberNo={memberNo} onAction={showToast} />}
            {activeTab === 'programmes' && <ProgrammesView onAction={showToast} />}
            {activeTab === 'perks' && (
              <PerksView
                copied={copied}
                onCopy={copyCode}
                notifOn={notifOn}
                setNotifOn={setNotifOn}
                onAction={showToast}
              />
            )}
          </div>
        </div>

        <BottomNav activeTab={activeTab} onNavigate={navigate} />

        <Toast message={toast} />
      </div>
    </div>
  );
}
