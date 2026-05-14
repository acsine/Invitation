# Mobile App Implementation Prompts — Invitation Manager

Ce document contient les prompts structurés pour implémenter l'application mobile **Invitation Manager** en utilisant **Expo (React Native)**. L'objectif est de créer une application performante, capable de fonctionner hors-ligne et de se synchroniser avec le backend Next.js.

## Phase 1 : Initialisation et Architecture

### Prompt 1 : Initialisation du Projet
> "Agis en tant qu'expert mobile. Initialise un projet **Expo (React Native)** avec **TypeScript** pour une application de gestion d'invités. 
> Installe les dépendances suivantes : 
> - `expo-router` (navigation)
> - `expo-sqlite` (stockage local)
> - `@tanstack/react-query` (gestion d'état et sync)
> - `axios` (appels API)
> - `lucide-react-native` (icônes)
> - `nativewind` (styling)
> Configure une structure de dossiers propre : `/app` (routes), `/components`, `/hooks`, `/services`, `/store`."

---

## Phase 2 : Stockage Local (Offline-First)

### Prompt 2 : Service SQLite
> "Crée un service de base de données en utilisant `expo-sqlite`. 
> L'application doit stocker localement les invités avant la synchronisation.
> Implémente une table `local_guests` avec les colonnes : `id`, `eventId`, `name`, `phone`, `additionalData` (JSON), `attendance` (JSON), `status`, `synced` (boolean).
> Ajoute des fonctions pour : 
> - Insérer un invité localement.
> - Récupérer les invités non synchronisés (`synced = 0`).
> - Marquer un invité comme synchronisé.
> - Nettoyer la base après sync."

---

## Phase 3 : Interface Utilisateur (Premium Design)

### Prompt 3 : Écran de Connexion & Sélection d'Événement
> "Crée une interface de connexion moderne et épurée (Glassmorphism, dégradés subtils).
> L'utilisateur doit pouvoir se connecter avec son email/password via l'endpoint `/api/mobile/auth/login`.
> Après connexion, affiche une liste des événements actifs récupérés depuis `/api/mobile/events?userId={id}`.
> Chaque carte d'événement doit afficher le nom, la date et le nombre total d'invités."

### Prompt 4 : Écran d'Ajout Rapide d'Invité
> "Implémente un écran d'ajout d'invité optimisé pour la rapidité sur le terrain.
> Champs : Nom, Téléphone, et un bouton 'Enregistrer localement'.
> Ajoute une validation en temps réel : si le numéro est déjà présent dans la base locale, affiche un avertissement.
> Une fois enregistré, l'invité doit apparaître dans une liste 'En attente de synchronisation' sur le tableau de bord mobile."

---

## Phase 4 : Synchronisation

### Prompt 5 : Logique de Synchronisation
> "Implémente un hook `useSyncGuests` utilisant **TanStack Query**.
> Ce hook doit :
> 1. Récupérer tous les invités locaux où `synced = 0`.
> 2. Envoyer ces données par lot (bulk) à l'endpoint `/api/mobile/sync/[eventId]`.
> 3. En cas de succès, mettre à jour la base SQLite locale pour marquer ces invités comme synchronisés.
> 4. Gérer les cas d'erreur (pas de réseau) avec une notification 'Sync échouée, sera retenté plus tard'."

---

## Phase 5 : Mode Présence (Scan/Check-in)

### Prompt 6 : Mode Check-in hors-ligne
> "Ajoute une fonctionnalité de check-in (présence). 
> L'utilisateur sélectionne un invité dans la liste locale et coche sa présence pour le jour/session actuel.
> Cette donnée de présence doit être stockée dans le champ JSON `attendance` localement et synchronisée lors du prochain cycle de sync."

---

## Instructions Supplémentaires pour le Backend
Assurez-vous que les variables d'environnement suivantes sont configurées pour le mobile :
- `EXPO_PUBLIC_API_URL` : URL de votre backend Next.js (ex: `https://invitation-gamma-azure.vercel.app`).
