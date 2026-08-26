import { useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import HomeView from './views/HomeView';
import CardView from './views/CardView';
import ProgrammesView from './views/ProgrammesView';
import PerksView from './views/PerksView';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [prevTab, setPrevTab] = useState('home');
  const [memberNo, setMemberNo] = useState(null);
  const [accessState, setAccessState] = useState('loading');
  const [copied, setCopied] = useState(false);
  const [notifOn, setNotifOn] = useState(true);
  const [toast, setToast] = useState(null);
  const scrollRef = useRef(null);

  const saveMemberNumber = (number) => {
    const clean = String(number || '')
      .replace(/\D/g, '')
      .slice(0, 4);

    if (!clean || clean === '859') {
      return false;
    }

    setMemberNo(clean);
    setAccessState('ready');

    try {
      localStorage.setItem('collective_member_number', clean);
    } catch {
      // Membership will still work for this browser session.
    }

    return true;
  };

  const loadStoredMemberNumber = () => {
    try {
      const stored =
        localStorage.getItem('collective_member_number') ||
        localStorage.getItem('member_number');

      if (stored && String(stored).replace(/\D/g, '') !== '859') {
        saveMemberNumber(stored);
      } else {
        localStorage.removeItem('collective_member_number');
        localStorage.removeItem('member_number');
        setAccessState('unverified');
      }
    } catch {
      setAccessState('unverified');
    }
  };

  const activateExecutive = async (memberNo, key) => {
    try {
      const res = await fetch('/api/executive-activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberNo,
          key,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.memberNo) {
        setAccessState('unverified');
        return;
      }

      saveMemberNumber(data.memberNo);

      // Remove the private activation key from the address bar.
      window.history.replaceState({}, '', window.location.pathname);
    } catch {
      setAccessState('unverified');
    }
  };

  // After Stripe checkout, retrieve the member number assigned
  // by the webhook. Retry briefly if Stripe's webhook is still processing.
  const lookupMemberNumber = async (sessionId, attempt = 1) => {
    try {
      const res = await fetch(
        `/api/member?session_id=${encodeURIComponent(sessionId)}`
      );

      const data = await res.json();

      if (data.memberNo) {
        saveMemberNumber(data.memberNo);

        // Remove session_id so it cannot be reused/bookmarked.
        window.history.replaceState({}, '', window.location.pathname);
        return;
      }

      if (data.pending && attempt < 5) {
        setTimeout(() => {
          lookupMemberNumber(sessionId, attempt + 1);
        }, 1500);
        return;
      }

      loadStoredMemberNumber();
    } catch {
      loadStoredMemberNumber();
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    const hashParams = new URLSearchParams(
      window.location.hash.replace(/^#/, '')
    );

    const executiveMember = hashParams.get('exec');
    const executiveKey = hashParams.get('key');

    if (executiveMember && executiveKey) {
      activateExecutive(executiveMember, executiveKey);
      return;
    }

    if (sessionId) {
      lookupMemberNumber(sessionId);
      return;
    }

    loadStoredMemberNumber();
  }, []);

  const showToast = (message, duration = 2200) => {
    setToast(message);
    setTimeout(() => setToast(null), duration);
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const navigate = (tab) => {
    if (tab === activeTab) {
      scrollToTop();
      showToast(
        tab === 'home'
          ? 'Already on Home'
          : `You are on ${tab}`,
        1500
      );
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
      // Clipboard may be unavailable.
    }

    setCopied(true);
    setToast('Code COLLECTIVE15 copied');

    setTimeout(() => setToast(null), 2000);
    setTimeout(() => setCopied(false), 2000);
  };

  if (accessState === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-xs tracking-[0.18em] uppercase text-black/40">
            Crescita Collective
          </p>

          <p className="mt-3 text-sm font-medium">
            Activating membership…
          </p>
        </div>
      </div>
    );
  }

  if (accessState === 'unverified') {
    return (
      <div className="min-h-screen bg-[#EDEDED] flex items-center justify-center px-6">
        <div className="w-full max-w-[420px] bg-white p-8 text-center">
          <p className="text-[11px] tracking-[0.18em] uppercase text-black/40">
            Crescita Collective
          </p>

          <h1 className="mt-4 text-2xl font-semibold">
            Membership activation required
          </h1>

          <p className="mt-3 text-sm leading-6 text-black/60">
            Open your membership confirmation link to activate
            the Collective on this device.
          </p>
        </div>
      </div>
    );
  }

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
              animation: `${
                prevTab !== activeTab ? 'slideUp' : 'fadeIn'
              } 0.38s cubic-bezier(0.16,1,0.3,1)`,
            }}
          >
            {activeTab === 'home' && (
              <HomeView
                memberNo={memberNo}
                onAction={showToast}
              />
            )}

            {activeTab === 'card' && (
              <CardView
                memberNo={memberNo}
                onAction={showToast}
              />
            )}

            {activeTab === 'programmes' && (
              <ProgrammesView onAction={showToast} />
            )}

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

        <BottomNav
          activeTab={activeTab}
          onNavigate={navigate}
        />

        <Toast message={toast} />
      </div>
    </div>
  );
}
