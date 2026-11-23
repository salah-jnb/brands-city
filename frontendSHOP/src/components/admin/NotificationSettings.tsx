import React, { useCallback, useEffect, useState } from 'react';
import { Bell, BellOff, BellRing, Download, Share, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { pushApi } from '@/services/api';
import {
  canPromptInstall,
  getReadyRegistration,
  isIOS,
  isPushSupported,
  isStandalone,
  onInstallStateChange,
  promptInstall,
  subscribeToPush,
} from '@/lib/pwa';

type Status = 'loading' | 'ios-install' | 'unsupported' | 'denied' | 'off' | 'on';

const NotificationSettings: React.FC = () => {
  const [status, setStatus] = useState<Status>('loading');
  const [busy, setBusy] = useState(false);
  const [installable, setInstallable] = useState(canPromptInstall());

  useEffect(() => onInstallStateChange(() => setInstallable(canPromptInstall())), []);

  const refresh = useCallback(async () => {
    if (!isPushSupported()) {
      setStatus(isIOS() && !isStandalone() ? 'ios-install' : 'unsupported');
      return;
    }
    if (Notification.permission === 'denied') {
      setStatus('denied');
      return;
    }
    try {
      const registration = await getReadyRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription && Notification.permission === 'granted') {
        // Réenregistre au besoin (ex. reconnexion) : l'opération est idempotente
        const saved = await pushApi.save(subscription);
        setStatus(saved.error ? 'off' : 'on');
      } else {
        setStatus('off');
      }
    } catch {
      setStatus('off');
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const enable = async () => {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'denied') {
        setStatus('denied');
        return;
      }
      if (permission !== 'granted') return;

      const registration = await getReadyRegistration();
      if (!registration) throw new Error('Service worker indisponible');
      // Le service push du navigateur peut ne jamais répondre (réseau coupé) : on abandonne après 20 s
      const subscription = await Promise.race([
        subscribeToPush(registration),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 20000)),
      ]);
      const saved = await pushApi.save(subscription);
      if (saved.error) throw new Error(saved.error);

      setStatus('on');
      toast.success('Notifications activées sur cet appareil');
    } catch (error) {
      console.error(error);
      toast.error("Impossible d'activer les notifications. Réessayez.");
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    try {
      const registration = await getReadyRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await pushApi.remove(subscription.endpoint);
        await subscription.unsubscribe();
      }
      setStatus('off');
      toast.success('Notifications désactivées sur cet appareil');
    } catch {
      toast.error('Impossible de désactiver les notifications.');
    } finally {
      setBusy(false);
    }
  };

  const sendTest = async () => {
    const registration = await getReadyRegistration();
    if (!registration) return;
    await registration.showNotification('Notification de test', {
      body: 'Tout fonctionne : vous serez prévenu à chaque nouvelle commande.',
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-96.png',
      tag: 'test',
      data: { url: '/admin/orders' },
    });
  };

  const install = async () => {
    const accepted = await promptInstall();
    if (accepted) toast.success('Application installée');
  };

  if (status === 'loading') return null;

  const showInstall = installable && !isStandalone();

  return (
    <div className="bg-card border border-border rounded-xl p-4 lg:p-5">
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-lg flex-shrink-0 ${
            status === 'on' ? 'bg-success/20 text-success' : 'bg-primary/10 text-primary'
          }`}
        >
          {status === 'on' ? <BellRing className="h-5 w-5" /> : status === 'denied' ? <BellOff className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground">Notifications de commandes</p>

          {status === 'on' && (
            <p className="text-sm text-success flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              Activées sur cet appareil
            </p>
          )}
          {status === 'off' && (
            <p className="text-sm text-muted-foreground mt-0.5">
              Recevez une alerte sur ce téléphone à chaque nouvelle commande, même application fermée.
            </p>
          )}
          {status === 'denied' && (
            <p className="text-sm text-muted-foreground mt-0.5">
              Les notifications sont bloquées. Autorisez-les dans les réglages du navigateur pour ce site, puis rechargez la page.
            </p>
          )}
          {status === 'unsupported' && (
            <p className="text-sm text-muted-foreground mt-0.5">
              Ce navigateur ne gère pas les notifications. Utilisez Chrome sur Android, ou Safari sur iPhone.
            </p>
          )}
          {status === 'ios-install' && (
            <p className="text-sm text-muted-foreground mt-0.5">
              Sur iPhone, installez d'abord l'application : touchez <Share className="inline h-4 w-4 -mt-1" /> <strong>Partager</strong>, puis{' '}
              <strong>« Sur l'écran d'accueil »</strong>. Ouvrez-la depuis l'icône, puis activez les notifications ici.
            </p>
          )}
        </div>
      </div>

      {(status === 'off' || status === 'on' || showInstall) && (
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          {status === 'off' && (
            <Button onClick={enable} disabled={busy} className="h-12 sm:h-10 gap-2">
              <Bell className="h-4 w-4" />
              {busy ? 'Activation...' : 'Activer les notifications'}
            </Button>
          )}
          {status === 'on' && (
            <>
              <Button variant="outline" onClick={sendTest} className="h-12 sm:h-10 gap-2">
                <BellRing className="h-4 w-4" />
                Envoyer un test
              </Button>
              <Button variant="ghost" onClick={disable} disabled={busy} className="h-12 sm:h-10 gap-2 text-muted-foreground">
                <BellOff className="h-4 w-4" />
                Désactiver
              </Button>
            </>
          )}
          {showInstall && (
            <Button variant="secondary" onClick={install} className="h-12 sm:h-10 gap-2">
              <Download className="h-4 w-4" />
              Installer l'application
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;
