import { useEffect, useRef, useState } from 'react';

import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import InstallApp from './components/InstallApp';

import HomeView from './views/HomeView';
import CardView from './views/CardView';
import ProgrammesView from './views/ProgrammesView';
import PerksView from './views/PerksView';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [prevTab, setPrevTab] = useState('home');

  const [memberNo, setMemberNo] = useState(null);
  const [accessState, setAccessState] = useState('loading');

  // Show the install/welcome screen immediately
  // after a NEW executive or Stripe activation.
  const [showInstallApp, setShowInstallApp] = useState(false);

  const [copied, setCopied] = useState(false);
  const [notifOn, setNotifOn] = useState(true);
  const [toast, setToast] = useState(null);

  const scrollRef = useRef(null);

  /*
   * ------------------------------------------------
   * MEMBER STORAGE
   * ------------------------------------------------
   */

  const saveMemberNumber = (number) => {
    const clean = String(number || '')
      .replace(/\D/g, '')
      .slice(0, 4);

    // Reject empty values and the old fake/demo #859.
    if (!clean || clean === '859') {
      return false;
    }

    setMemberNo(clean);
    setAccessState('ready');

    try {
      localStorage.setItem(
        'collective_member_number',
        clean
      );
    } catch {
      // Membership still works for this browser session.
    }

    return true;
  };

  const loadStoredMemberNumber = () => {
    try {
      const stored =
        localStorage.getItem('collective_member_number') ||
        localStorage.getItem('member_number');

      if (
        stored &&
        String(stored).replace(/\D/g, '') !== '859'
      ) {
        /*
         * Returning member.
         *
         * Open the member app directly.
         * Do NOT show the welcome/install screen every visit.
         */
        saveMemberNumber(stored);
        return;
      }

      // Remove any old demo values.
      localStorage.removeItem(
        'collective_member_number'
      );

      localStorage.removeItem(
        'member_number'
      );

      // No membership stored = public Join page.
      setAccessState('unverified');
    } catch {
      setAccessState('unverified');
    }
  };

  /*
   * ------------------------------------------------
   * EXECUTIVE ACTIVATION
   * ------------------------------------------------
   */

  const activateExecutive = async (
    executiveMemberNo,
    key
  ) => {
    try {
      const res = await fetch(
        '/api/executive-activate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            memberNo: executiveMemberNo,
            key,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.memberNo) {
        setAccessState('unverified');
        return;
      }

      /*
       * Executive successfully activated.
       */
      saveMemberNumber(data.memberNo);

      /*
       * Fresh activation:
       * show the PWA welcome/install screen.
       */
      setShowInstallApp(true);

      /*
       * Remove the private executive key
       * from the address bar immediately.
       */
      window.history.replaceState(
        {},
        '',
        window.location.pathname
      );
    } catch {
      setAccessState('unverified');
    }
  };

  /*
   * ------------------------------------------------
   * STRIPE MEMBER LOOKUP
   * ------------------------------------------------
   */

  const lookupMemberNumber = async (
    sessionId,
    attempt = 1
  ) => {
    try {
      const res = await fetch(
        `/api/member?session_id=${encodeURIComponent(
          sessionId
        )}`
      );

      const data = await res.json();

      if (data.memberNo) {
        /*
         * Successful paid membership.
         */
        saveMemberNumber(data.memberNo);

        /*
         * Fresh paid member:
         * show PWA welcome/install screen.
         */
        setShowInstallApp(true);

        /*
         * Remove Stripe session_id from URL.
         */
        window.history.replaceState(
          {},
          '',
          window.location.pathname
        );

        return;
      }

      /*
       * Stripe may redirect the browser before
       * the webhook has finished allocating the number.
       */
      if (data.pending && attempt < 5) {
        setTimeout(() => {
          lookupMemberNumber(
            sessionId,
            attempt + 1
          );
        }, 1500);

        return;
      }

      /*
       * If Stripe lookup fails, check whether
       * this browser already belongs to a member.
       */
      loadStoredMemberNumber();
    } catch {
      loadStoredMemberNumber();
    }
  };

  /*
   * ------------------------------------------------
   * INITIAL APP ROUTING
   * ------------------------------------------------
   */

  useEffect(() => {
    /*
     * Stripe return:
     *
     * ?session_id=cs_...
     */
    const params = new URLSearchParams(
      window.location.search
    );

    const sessionId =
      params.get('session_id');

    /*
     * Executive activation:
     *
     * #exec=001&key=xxxxxxxx
     */
    const hashParams = new URLSearchParams(
      window.location.hash.replace(/^#/, '')
    );

    const executiveMember =
      hashParams.get('exec');

    const executiveKey =
      hashParams.get('key');

    /*
     * Executive activation has priority.
     */
    if (
      executiveMember &&
      executiveKey
    ) {
      activateExecutive(
        executiveMember,
        executiveKey
      );

      return;
    }

    /*
     * Stripe activation.
     */
    if (sessionId) {
      lookupMemberNumber(sessionId);
      return;
    }

    /*
     * Normal visitor / returning member.
     */
    loadStoredMemberNumber();
  }, []);

  /*
   * ------------------------------------------------
   * MEMBER APP UTILITIES
   * ------------------------------------------------
   */

  const showToast = (
    message,
    duration = 2200
  ) => {
    setToast(message);

    setTimeout(() => {
      setToast(null);
    }, duration);
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
      await navigator.clipboard.writeText(
        'COLLECTIVE15'
      );
    } catch {
      // Clipboard may be unavailable.
    }

    setCopied(true);

    setToast(
      'Code COLLECTIVE15 copied'
    );

    setTimeout(() => {
      setToast(null);
    }, 2000);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  /*
   * =================================================
   * 1. LOADING
   * =================================================
   */

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

  /*
   * =================================================
   * 2. PUBLIC JOIN PAGE
   * =================================================
   *
   * This is what a potential customer sees at:
   *
   * https://collective.crescita.co.za
   */

  if (accessState === 'unverified') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">

        <div className="w-full max-w-[420px] flex flex-col items-center justify-center text-center">

          <div
            className="text-[22px] font-semibold tracking-[0.22em] text-black"
            style={{
              fontFamily:
                'Arial, Helvetica, sans-serif',
            }}
          >
            CRESCITA
          </div>

          <a
            href="https://buy.stripe.com/8x2cN615R9gPeVFb2i3oA0j"
            className="mt-14 inline-flex items-center justify-center min-w-[210px] h-[54px] px-8 rounded-full bg-black text-white text-[11px] font-semibold tracking-[0.16em] uppercase transition-transform active:scale-[0.98]"
          >
            Join the Collective
          </a>

        </div>
      </div>
    );
  }

  /*
   * =================================================
   * 3. NEW MEMBER INSTALL / WELCOME SCREEN
   * =================================================
   *
   * Appears after:
   *
   * - executive activation
   * - successful Stripe activation
   */

  if (
    accessState === 'ready' &&
    showInstallApp &&
    memberNo
  ) {
    return (
      <InstallApp
        memberNo={memberNo}
        onContinue={() => {
          setShowInstallApp(false);
        }}
      />
    );
  }

  /*
   * =================================================
   * 4. PRIVATE MEMBER APP
   * =================================================
   */

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
                prevTab !== activeTab
                  ? 'slideUp'
                  : 'fadeIn'
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
              <ProgrammesView
                onAction={showToast}
              />
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
