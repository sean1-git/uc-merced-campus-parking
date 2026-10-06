// PWA = an installable website that can also open offline.
const installButton = document.getElementById('install');
const installHelp = document.getElementById('install-help');
let installPrompt = null;

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  installPrompt = event;
});

window.addEventListener('appinstalled', () => {
  installButton.hidden = true;
  installHelp.hidden = true;
  installPrompt = null;
});

if (window.matchMedia('(display-mode: standalone)').matches) {
  installButton.hidden = true;
}

installButton.addEventListener('click', async () => {
  if (installPrompt) {
    await installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    return;
  }

  installHelp.hidden = !installHelp.hidden;
  installHelp.textContent = 'Use your browser’s Install app option. On iPhone, use Safari → Share → Add to Home Screen. Installation needs HTTPS or localhost.';
});

async function enableOfflineSupport() {
  if (!('serviceWorker' in navigator)) return;

  try {
    await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    // Wait until this page's requests go through the service worker.
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve) => {
        navigator.serviceWorker.addEventListener('controllerchange', resolve, {once: true});
      });
    }
    window.dispatchEvent(new Event('parking-offline-ready'));
  } catch {
    installHelp.hidden = false;
    installHelp.textContent = 'Offline mode is unavailable. You can still use the dashboard online.';
  }
}

enableOfflineSupport();

