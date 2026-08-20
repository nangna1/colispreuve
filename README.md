# ColisPreuve

Preuve numérique de livraison (photo + géolocalisation + heure, à
l'enlèvement et à la livraison) et gestion des litiges pour transporteurs
et commerçants — né de l'analyse d'un kit de documents "gestion et
logistique" dont les dizaines de lettres types de litige (retard,
marchandises endommagées, quantité incomplète...) révèlent un point de
douleur réel, géré aujourd'hui au téléphone sans aucune preuve horodatée.

Trois volets dans une seule codebase :

- **Dashboard expéditeur** (`/expediteur`) — création d'expédition,
  assignation d'un chauffeur, suivi des preuves, génération de lettre de
  réclamation en cas d'écart.
- **App chauffeur** (`/chauffeur`) — mobile-first, hors-ligne : écrans
  Enlèvement et Livraison (photo, géolocalisation automatique, signature),
  file d'attente synchronisée au retour du réseau.
- **Portail public de suivi** (`/suivi/[token]`) — sans compte, le
  destinataire accède via un lien à token envoyé par SMS/WhatsApp.

## État d'avancement

Cette passe pose la **fondation** uniquement (schéma, RLS, authentification
expéditeur/chauffeur, surveillance d'erreurs) — voir le plan complet dans
`C:\Users\HP\.claude\plans\sequential-dreaming-coral.md`. Les vrais écrans
(tableau de bord expéditeur, flux chauffeur avec photo/géoloc/signature,
génération de lettre de réclamation) restent à construire, dans cet ordre :

1. ~~Fondation~~ ✅
2. Dashboard expéditeur
3. App chauffeur en mode hors-ligne
4. Portail public de suivi *(squelette fonctionnel déjà en place)*
5. Génération de lettre de réclamation
6. Notification destinataire (SMS/WhatsApp)

## 1. Créer le projet Supabase

1. Créez un projet gratuit sur [supabase.com](https://supabase.com).
2. Dans **SQL Editor**, exécutez dans l'ordre :
   - `supabase/migrations/0001_init.sql` (schéma + RLS)
3. Copiez `.env.example` vers `.env.local` et renseignez l'URL et la clé
   anonyme du projet (**Project Settings → API**). Ajoutez aussi
   `SUPABASE_SERVICE_ROLE_KEY` (même écran, secret "service_role") — requis
   pour créer un compte chauffeur. Ne la partagez jamais : elle contourne
   totalement la RLS.

## 2. Créer votre premier compte expéditeur

`auth.users` ne peut pas être peuplée par migration (mots de passe gérés
par Supabase Auth) :

1. **Authentication → Users → Add user** dans le dashboard Supabase (email +
   mot de passe).
2. Copiez l'UUID généré.
3. Adaptez et exécutez `supabase/seed_profiles.example.sql` (dans le SQL
   Editor) pour créer l'entreprise et relier ce compte au rôle `expediteur`.

## 3. Lancer l'app

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) — vous serez
redirigé vers `/login`, puis vers `/expediteur` ou `/chauffeur` selon le
rôle du compte connecté.

**Important** : sans projet Supabase configuré (étapes 1-2), l'app ne rend
rien — l'authentification est vérifiée sur chaque requête (`src/proxy.ts`),
y compris `/login`. Seules `/login` et `/suivi/[token]` sont accessibles
sans compte.

## Comptes chauffeur

Depuis le tableau de bord expéditeur (à construire — étape 2), l'expéditeur
crée un accès chauffeur (`createDriverAccess`,
`src/app/actions/driver-access.ts`) : un code à 8 caractères est généré, un
vrai compte `auth.users` est créé côté serveur via la clé service_role, et
le code s'affiche **une seule fois**. Le chauffeur se connecte ensuite sur
`/login`, onglet "Chauffeur", en tapant uniquement ce code.

Techniquement, ce code *est* le mot de passe (un e-mail interne
`CODE@chauffeurs.colispreuve.local` est fabriqué pour satisfaire Supabase
Auth, qui exige un identifiant, mais n'est ni affiché ni utilisé ailleurs)
— même principe que les comptes élève de Scolaris.

## Portail public de suivi

`/suivi/[token]` n'exige aucune authentification (voir `src/proxy.ts`,
`isPublicRoute`). L'accès est protégé par la possession du token opaque
(`expeditions.token_public`, un uuid), validé côté serveur dans
`src/app/actions/tracking.ts` — volontairement **aucune policy RLS
ouverte à `anon`** sur la table `expeditions` : la Server Action utilise le
client `service_role` et ne renvoie que les champs utiles au destinataire.

## Surveillance d'erreurs (Sentry)

Mise en place dès la fondation (contrairement à Scolaris, où son absence a
été découverte après coup) : créez un projet Next.js sur
[sentry.io](https://sentry.io), copiez le DSN dans `NEXT_PUBLIC_SENTRY_DSN`
(`.env.local` + variables d'environnement Vercel une fois déployé).

## Tests

```bash
npm test
```

Suite Vitest, même approche que Scolaris (intégration réelle contre le
projet Supabase de dev, pas de mock) — à construire au fil des écrans.

## Structure

- `src/lib/supabase/` — clients Supabase (browser/server/admin) + types
  `Database` écrits à la main en miroir du schéma SQL.
- `src/lib/auth/driver-code.ts` — génération du code d'accès chauffeur.
- `src/lib/providers/messaging-provider.ts` — interface d'envoi SMS/
  WhatsApp au destinataire, stub tant qu'aucun compte n'est branché.
- `supabase/migrations/0001_init.sql` — schéma complet + RLS.
