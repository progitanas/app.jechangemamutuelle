# JechangeMaMutuelle

Application SaaS full stack (Next.js App Router + Prisma + MySQL + Stripe) pour gérer des demandes mutuelle, paiements en ligne, leads clients et administration.

Une architecture prod Vercel + Cloudflare est aussi fournie dans ce repo:
- Frontend: Vercel (Next.js)
- Backend API dédié: Cloudflare Workers
- Base backend API: Cloudflare D1

## Stack

- Frontend: Next.js 16 (App Router), Tailwind CSS
- Backend: Route handlers Next.js (API)
- DB: MySQL
- ORM: Prisma
- Auth: Email/mot de passe hash bcrypt + session JWT cookie
- Validation: Zod
- Formulaires: React Hook Form
- Paiement: Stripe Checkout + webhook

## Features incluses

- Auth complète: register, login, logout, hash mot de passe, rôles USER/ADMIN
- Dashboard client:
  - demandes
  - création demande
  - commandes et statut paiement
  - leads visibles après paiement
  - profil éditable
- Dashboard admin:
  - vue globale KPI
  - listing users/demandes/orders/leads
  - filtres simples
  - changement de statuts demandes/leads
- Stripe:
  - création session checkout
  - webhook checkout.session.completed
  - mise à jour statut paiement + demande + déblocage leads
- Bootstrap admin optionnel via variables d'environnement
- B2B lead distribution:
  - gestion partenaires B2B
  - import en masse de partenaires (CSV/texte)
  - envoi de leads vers partenaires depuis l'admin
  - traçabilité des envois (canal, date, statut)

## Arborescence principale

- src/app/page.tsx: Landing
- src/app/(auth): login/register
- src/app/dashboard: espace client
- src/app/admin: espace admin
- src/app/api: auth, requests, profile, stripe, admin status
- src/app/admin/partners: gestion partenaires B2B
- src/app/api/admin/partners: création + listing partenaires
- src/app/api/admin/partners/import: import en masse
- src/app/api/admin/lead-send: envoi lead vers partenaire
- src/components: forms, shell, cards, badges
- src/lib: auth, prisma, stripe, schemas
- prisma/schema.prisma: modèles et enums
- prisma/seed.ts: bootstrap admin optionnel

## Installation

Important: execute all commands from the app folder `jechangemamutuelle`.

1. Installer les dépendances

npm install

2. Configurer les variables

Copier .env.example en .env puis adapter les valeurs.

3. Migrer la base

npm run prisma:migrate
npm run prisma:generate

4. Bootstrap admin (optionnel)

npm run prisma:seed

Si `ADMIN_EMAIL` et `ADMIN_PASSWORD` sont définis, un compte admin est créé.
Sinon, aucun compte n'est pré-créé et le premier compte inscrit devient admin.

5. Lancer en local

npm run dev

## Workflow B2B leads

1. Aller sur `/admin/partners`
2. Ajouter des partenaires unitairement ou via import en masse
3. Aller sur `/admin/leads`
4. Choisir un partenaire + canal puis cliquer sur `Envoyer`

Le système enregistre une livraison, passe le lead en `DELIVERED` et met à jour la demande associée en `DELIVERED`.

## Prérequis base de données

- MySQL doit être démarré sur `localhost:3306` avec les identifiants de `.env`.
- Si Docker est installé, vous pouvez lancer:

docker compose up -d

## Stripe local

1. Installer Stripe CLI
2. Lancer le forward webhook vers Next.js:

stripe listen --forward-to localhost:3000/api/stripe/webhook

3. Copier le secret whsec... dans STRIPE_WEBHOOK_SECRET

## Deployment Vercel

- Définir variables d'environnement (.env.example)
- Branch push puis import projet sur Vercel
- Configurer DB MySQL et secrets Stripe

## Architecture 100% prod recommandée

### 1. Frontend (Vercel)

Déployer le dossier racine `jechangemamutuelle` sur Vercel.

Variables minimales Vercel:
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_API_BASE_URL` (URL du Worker Cloudflare, ex: `https://jmm-backend.<subdomain>.workers.dev`)
- `API_BEARER_TOKEN` (si tu sécurises les appels vers Worker)
- variables auth/stripe existantes

### 2. Backend (Cloudflare Worker + D1)

Le backend Cloudflare est dans `cloudflare-backend/`.

Commandes:

```bash
cd cloudflare-backend
npm install
npx wrangler d1 create jmm-prod-db
```

Reporter le `database_id` dans `cloudflare-backend/wrangler.toml`.

Appliquer la migration D1:

```bash
npx wrangler d1 migrations apply jmm-prod-db --remote
```

Définir les secrets backend:

```bash
npx wrangler secret put API_TOKEN
```

Déployer le Worker:

```bash
npm run deploy
```

### 3. CORS / sécurité

- Mettre `CORS_ORIGIN` dans `wrangler.toml` avec ton domaine Vercel final.
- Ne jamais exposer `API_TOKEN` côté client public si tu fais des appels sensibles depuis le navigateur.

## Backend Cloudflare livré

`cloudflare-backend/src/index.ts` expose:
- `GET /health`
- `POST /v1/campaigns`
- `GET /v1/campaigns/:id`
- `PATCH /v1/campaigns/:id/quota`
- `POST /v1/leads/reject`
- `PATCH /v1/leads/reject/:id/review`

`cloudflare-backend/migrations/0001_init.sql` crée:
- `campaigns`
- `lead_rejections`

## Notes

- Scope volontairement simple et solide
- Architecture modulaire pour évoluer sans surcomplexité
