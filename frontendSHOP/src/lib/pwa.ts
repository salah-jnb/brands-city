// Outils PWA de l'espace admin : manifeste, service worker, installation, notifications push.

// Clé publique VAPID (publique par conception). La clé privée n'existe que sur Vercel.
export const VAPID_PUBLIC_KEY =
  (import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined) ||
  'BANaHPqGj_bkCLTTjTaEIi-dnD-6ry0SICqSiZuR1OiVGqL-iVgngZrK_VCItv3AkagIq-J__T1W76YhXNX7Az0';

const MANIFEST_HREF = '/manifest-admin.webmanifest';
const SW_URL = '/sw.js';
const SW_SCOPE = '/admin';

// Le manifeste n'est ajouté que dans /admin : le site client n'est pas proposé à l'installation.
export function attachAdminManifest(): () => void {
  let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
  const created = !link;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'manifest';
    link.href = MANIFEST_HREF;
    document.head.appendChild(link);
  }
  return () => {
    if (created) link?.remove();
  };
}

export async function registerAdminServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE });
  } catch (error) {
    console.error('Service worker non enregistré', error);
    return null;
  }
}

export const isStandalone = (): boolean =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

export const isIOS = (): boolean =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export const isPushSupported = (): boolean =>
  'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

// --- Invite d'installation (Android / Chrome) ---
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
const installListeners = new Set<() => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event as BeforeInstallPromptEvent;
    installListeners.forEach((cb) => cb());
  });
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    installListeners.forEach((cb) => cb());
  });
}

export const canPromptInstall = (): boolean => deferredInstallPrompt !== null;

export function onInstallStateChange(cb: () => void): () => void {
  installListeners.add(cb);
  return () => installListeners.delete(cb);
}

export async function promptInstall(): Promise<boolean> {
  if (!deferredInstallPrompt) return false;
  await deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  installListeners.forEach((cb) => cb());
  return outcome === 'accepted';
}

// --- Push ---
export function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export async function getReadyRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  const registered = await registerAdminServiceWorker();
  if (!registered) return null;
  return navigator.serviceWorker.ready;
}

export async function subscribeToPush(registration: ServiceWorkerRegistration): Promise<PushSubscription> {
  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
  });
}
