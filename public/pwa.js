const installButton = document.getElementById('install');
const installHelp = document.getElementById('install-help');
let installPrompt = null;

window.addEventListener('beforeinstallprompt', (event) => {
  // Defer the browser prompt until the student chooses Install app.
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
  } catch {
    installHelp.hidden = false;
    installHelp.textContent = 'Offline mode is unavailable. You can still use the dashboard online.';
  }
}

enableOfflineSupport();

