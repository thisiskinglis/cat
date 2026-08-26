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

  const loadStoredMemberNumber = () => {
    try {
      const stored =
        localStorage.getItem('collective_member_number') ||
        localStorage.getItem('member_number') ||
        DEFAULT_MEMBER_NO;
      setMemberNo(stored.replace(/\D/g, '').slice(0, 4) || DEFAULT_MEMBER_NO);
    } catch {
      setMemberNo(DEFAULT_MEMBER_NO);
    }
  };

  // After a Stripe payment, the customer lands back here with
  // ?session_id=... in the URL. Look that up to get their real,
  // auto-assigned member number. Otherwise, fall back to whatever
  // this device already has saved.
  const lookupMemberNumber = async (sessionId, attempt = 1) => {
    try {
      const res = await fetch(`/api/member?session_id=${sessionId}`);
      const data = await res.json();

      if (data.memberNo) {
        setMemberNo(data.memberNo);
        try {
          localStorage.setItem('collective_member_number', data.memberNo);
        } catch {
          // localStorage may be unavailable (private browsing, etc) — fine,
          // the number still shows for this session.
        }
        // Remove session_id from the URL so it isn't reused or bookmarked.
        window.history.replaceState({}, '', window.location.pathname);
      } else if (data.pending && attempt < 5) {
        // The webhook may still be processing — retry briefly before
        // giving up and falling back to local storage.
        setTimeout(() => lookupMemberNumber(sessionId, attempt + 1), 1500);
      } else {
        loadStoredMemberNumber();
      }
    } catch {
      loadStoredMemberNumber();
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (sessionId) {
      lookupMemberNumber(sessionId);
    } else {
      loadStoredMemberNumber();
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
