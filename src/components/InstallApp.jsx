import { useEffect, useState } from 'react';

export default function InstallApp({
  memberNo,
  onContinue,
}) {
  const [installPrompt, setInstallPrompt] = useState(
    () => window.crescitaInstallPrompt || null
  );

  const [instructionMode, setInstructionMode] =
    useState(null);

  const isStandalone =
    window.matchMedia?.('(display-mode: standalone)')?.matches ||
    window.navigator.standalone === true;

  const isIOS =
    /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
    (
      /Macintosh/i.test(window.navigator.userAgent) &&
      window.navigator.maxTouchPoints > 1
    );

  const wasInstalled = (() => {
    try {
      return (
        localStorage.getItem('crescita_pwa_installed') ===
        'true'
      );
    } catch {
      return false;
    }
  })();

  useEffect(() => {
    const handleInstallReady = () => {
      setInstallPrompt(
        window.crescitaInstallPrompt || null
      );
    };

    const handleInstalled = () => {
      setInstallPrompt(null);

      try {
        localStorage.setItem(
          'crescita_pwa_installed',
          'true'
        );
      } catch {
        // Ignore storage errors.
      }

      onContinue();
    };

    window.addEventListener(
      'crescita-install-ready',
      handleInstallReady
    );

    window.addEventListener(
      'appinstalled',
      handleInstalled
    );

    return () => {
      window.removeEventListener(
        'crescita-install-ready',
        handleInstallReady
      );

      window.removeEventListener(
        'appinstalled',
        handleInstalled
      );
    };
  }, [onContinue]);

  const markSeen = () => {
    try {
      localStorage.setItem(
        'crescita_install_welcome_seen',
        'true'
      );
    } catch {
      // Ignore storage errors.
    }
  };

  const handleContinue = () => {
    markSeen();
    onContinue();
  };

  const handleInstall = async () => {
    /*
     * App is already running as an installed PWA.
     */
    if (isStandalone || wasInstalled) {
      markSeen();
      onContinue();
      return;
    }

    /*
     * iPhone / iPad:
     * Apple uses Add to Home Screen rather than
     * beforeinstallprompt.
     */
    if (isIOS) {
      setInstructionMode('ios');
      return;
    }

    /*
     * Chrome / Edge / supported Android browsers.
     */
    if (installPrompt) {
      try {
        await installPrompt.prompt();

        const choice =
          await installPrompt.userChoice;

        window.crescitaInstallPrompt = null;
        setInstallPrompt(null);

        if (choice?.outcome === 'accepted') {
          markSeen();

          /*
           * appinstalled normally fires afterwards.
           * This fallback ensures we don't trap the user.
           */
          setTimeout(() => {
            onContinue();
          }, 800);
        }
      } catch {
        setInstructionMode('browser');
      }

      return;
    }

    /*
     * Browser supports installation but hasn't supplied
     * a programmable prompt, so give manual instructions.
     */
    setInstructionMode('browser');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-[420px] text-center">

        <div className="syne font-[800] tracking-[0.18em] text-[20px]">
          CRESCITA
        </div>

        <p className="mt-10 text-[11px] font-[600] tracking-[0.18em] uppercase text-black/40">
          Welcome to the Collective
        </p>

        <h1 className="syne mt-3 text-[32px] font-[700] tracking-[-0.04em]">
          MEMBER #{memberNo}
        </h1>

        <p className="mt-5 text-[14px] leading-6 text-black/55 max-w-[310px] mx-auto">
          Add the Collective to your phone for direct
          access to your membership, programmes and
          member benefits.
        </p>

        {!instructionMode && (
          <>
            <button
              type="button"
              onClick={handleInstall}
              className="mt-10 w-full max-w-[280px] h-[54px] rounded-full bg-black text-white text-[11px] font-[700] tracking-[0.14em] uppercase tap"
            >
              Install App
            </button>

            <button
              type="button"
              onClick={handleContinue}
              className="mt-4 text-[11px] font-[600] tracking-[0.10em] uppercase text-black/45"
            >
              Continue to Collective
            </button>
          </>
        )}

        {instructionMode === 'ios' && (
          <div className="mt-10 border border-black/[0.08] rounded-[24px] p-6">

            <p className="syne text-[18px] font-[700]">
              Add to your Home Screen
            </p>

            <p className="mt-4 text-[13px] leading-6 text-black/60">
              Tap the <strong>Share</strong> button in
              your browser, then choose{' '}
              <strong>Add to Home Screen</strong>.
            </p>

            <button
              type="button"
              onClick={handleContinue}
              className="mt-6 w-full h-[50px] rounded-full bg-black text-white text-[11px] font-[700] tracking-[0.12em] uppercase"
            >
              Continue
            </button>

          </div>
        )}

        {instructionMode === 'browser' && (
          <div className="mt-10 border border-black/[0.08] rounded-[24px] p-6">

            <p className="syne text-[18px] font-[700]">
              Install the Collective
            </p>

            <p className="mt-4 text-[13px] leading-6 text-black/60">
              Open your browser menu and choose{' '}
              <strong>Install app</strong> or{' '}
              <strong>Add to Home Screen</strong>.
            </p>

            <button
              type="button"
              onClick={handleContinue}
              className="mt-6 w-full h-[50px] rounded-full bg-black text-white text-[11px] font-[700] tracking-[0.12em] uppercase"
            >
              Continue
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
