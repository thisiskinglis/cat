import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

/*
 * Capture the browser PWA install event immediately.
 * We store it globally so the member welcome screen can
 * trigger the native install dialog after activation.
 */
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();

  window.crescitaInstallPrompt = event;

  window.dispatchEvent(
    new Event('crescita-install-ready')
  );
});

window.addEventListener('appinstalled', () => {
  window.crescitaInstallPrompt = null;

  try {
    localStorage.setItem(
      'crescita_pwa_installed',
      'true'
    );
  } catch {
    // Ignore storage errors.
  }
});
// Prevent multi-touch pinch zoom inside the installed PWA.
document.addEventListener(
  'touchmove',
  (event) => {
    if (event.touches && event.touches.length > 1) {
      event.preventDefault();
    }
  },
  { passive: false }
);

ReactDOM.createRoot(
  document.getElementById('root')
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
