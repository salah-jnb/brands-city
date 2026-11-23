# Migration vers Supabase

## 1. Créer le projet
1. https://supabase.com → New project (notez le mot de passe de la base).
2. **Authentication > Providers > Email** : désactivez **Confirm email**
   (sinon une nouvelle inscription ne peut pas se connecter avant d'avoir cliqué le mail).

## 2. Base de données
Dans **SQL Editor**, exécutez dans l'ordre :
1. `01_schema.sql` : tables, RLS, fonctions `add_to_cart` / `create_order`, bucket `shoes`
2. `02_users.private.sql` (local uniquement, non versionné : emails + hash) puis `02_data.sql` : produits, commandes

Vérification rapide :
```sql
select email, role from public.profiles;   -- admin@shoeshop.com doit être 'Admin'
select count(*) from public.shoes;          -- 5
```

## 3. Images
**Storage > bucket `shoes`** : créez le dossier `images` et envoyez-y les fichiers de
`backendSHOP/backendSHOP/wwwroot/images/` :
`product-2.png`, `product-4.png`, `noir_20260210_192937.jpeg`, `blanc_20260210_192937.jpeg`, `nampr.jpeg`.

Les chemins en base (`/images/xxx`) sont conservés : le frontend les résout vers le bucket.
Les images `product-1.png`, `product-6.png` et `product-.png` n'existaient déjà pas dans
`wwwroot` : ces produits auront une image cassée tant que vous ne les remplacez pas depuis l'admin.

## 4. Frontend
```
cd frontendSHOP
copy .env.example .env      # puis renseignez URL + clé anon (Project Settings > API)
npm run dev
```
Connexion admin : `admin@shoeshop.com` / `Admin123!` (mot de passe d'origine).

## 5. Ensuite
Le dossier `backendSHOP` n'est plus utilisé : vous pouvez l'arrêter et le supprimer
une fois la migration validée. Déploiement du frontend : Vercel / Netlify / Cloudflare Pages
(ajoutez les 2 variables `VITE_SUPABASE_*` dans leurs réglages).

## 6. Application installable + notifications de commandes (PWA)

**Côté base** : exécuter `03_push.sql` (déjà fait sur le projet actuel), puis renseigner une fois :
```sql
insert into private.settings (key, value) values
  ('notify_url',    'https://VOTRE-SITE.vercel.app/api/notify-order'),
  ('notify_secret', '<valeur de WEBHOOK_SECRET>')
on conflict (key) do update set value = excluded.value;
```

**Côté Vercel** (Settings > Environment Variables, puis Redeploy) :
| Variable | Valeur |
|---|---|
| `VAPID_PRIVATE_KEY` | clé privée (fichier local `supabase/push-secrets.private.txt`) |
| `WEBHOOK_SECRET` | secret (même fichier, identique à `notify_secret` en base) |

Ces deux valeurs sont secrètes : ne jamais les mettre dans le code ni dans git.
La clé publique VAPID est dans le code (`src/lib/pwa.ts`, `api/notify-order.js`) : elle est publique.

**Sur le téléphone du client** (ouvrir `/admin` connecté en admin, onglet Dashboard) :
- **Android / Chrome** : « Installer l'application », puis « Activer les notifications ».
- **iPhone / Safari** (iOS 16.4 minimum) : Partager > « Sur l'écran d'accueil », ouvrir l'app
  depuis l'icône, puis « Activer les notifications ». Sans l'installation, iOS n'autorise pas les notifications.
- Le bouton « Envoyer un test » vérifie que le téléphone affiche bien les notifications.
