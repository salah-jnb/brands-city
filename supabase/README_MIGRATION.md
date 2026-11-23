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
