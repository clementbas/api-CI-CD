# API Fruits Shop

API REST robuste pour un systeme d'achat de fruits avec:
- Authentification JWT (register/login/me)
- Catalogue de fruits (CRUD admin + listing public)
- Panier utilisateur
- Commandes a partir du panier
- Validation des donnees et gestion d'erreurs centralisee

## Stack

- Node.js + Express
- MongoDB Atlas + Mongoose
- JWT + bcryptjs
- express-validator
- Redis (cache) via ioredis
- k6 (tests de charge)

## Installation

```bash
npm install
```

## Variables d'environnement

`.env`:

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret
JWT_EXPIRES_IN=7d
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

## Lancer l'API

```bash
npm run dev
```

ou

```bash
npm run start
```

Base URL:

```text
http://localhost:8000/api/v1
```

## Peuplement initial des fruits

Pour eviter de creer les fruits un par un, le projet contient un script de seed:
- `scripts/seed-fruits.js`

Commande:

```bash
npm run seed:fruits
```

Ce script:
- ajoute/met a jour une liste initiale de fruits
- est idempotent (vous pouvez le relancer sans dupliquer les donnees)

Prerequis:
- MongoDB accessible via `MONGO_URI`
- variables d'environnement chargees

## Endpoints principaux

### Health
- `GET /health`

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (token requis)

### Fruits
- `GET /fruits`
- `GET /fruits/:id`
- `POST /fruits` (admin)
- `PATCH /fruits/:id` (admin)
- `DELETE /fruits/:id` (admin, soft delete)

### Panier
- `GET /cart`
- `POST /cart/items`
- `PATCH /cart/items/:fruitId`
- `DELETE /cart/items/:fruitId`
- `DELETE /cart/clear`

### Commandes
- `POST /orders`
- `GET /orders`
- `GET /orders/:id`
- `PATCH /orders/:id/status` (admin)

## Bonnes pratiques appliquees

- Architecture modulaire: `controllers`, `models`, `routes`, `middlewares`, `utils`
- Validation stricte des entrees
- Middleware d'auth + autorisation par role
- Soft delete des fruits pour eviter la perte de donnees
- Snapshot des prix en panier/commande
- Gestion d'erreurs globale + reponses JSON coherentes
- Arret graceful du serveur (`SIGINT`, `SIGTERM`)

## Redis: a quoi ca sert dans ce projet

Redis est utilise comme cache pour accelerer les lectures frequentes, en particulier la route `GET /fruits`.

Objectif:
- reduire le nombre de requetes MongoDB
- diminuer la latence (surtout le p95 en charge)
- garder une reponse stable sous trafic

Fonctionnement mis en place:
- sur `GET /fruits`, l'API tente d'abord une lecture cache
- en cas de cache miss, l'API lit MongoDB puis enregistre la reponse en cache avec un TTL
- apres `create/update/delete` fruit, l'API invalide les cles `fruits:*` pour eviter les donnees perimees

### Lancer Redis en local (macOS)

Installation:

```bash
brew install redis
```

Demarrer Redis:

```bash
redis-server
```

Verifier:

```bash
redis-cli ping
# PONG
```

### Verifier le cache

```bash
redis-cli KEYS "fruits:*"
redis-cli TTL "<une-cle-fruits>"
```

## k6: tests de charge

k6 sert a mesurer les performances reelles de l'API sous charge (latence, erreurs, debit).

### Installation

macOS (Homebrew):

```bash
brew install k6
```

Verifier:

```bash
k6 version
```

### Lancer un test

Script actuel:
- `tests/perf/fruit-load.js`

Commande:

```bash
k6 run tests/perf/fruit-load.js
```

### Lire les metriques importantes

- `http_req_duration p(95)`: latence de reference (95% des requetes)
- `http_req_failed`: taux d'erreur HTTP
- `checks_succeeded`: validations metier du script k6

### Cold cache vs warm cache

- cold cache: cache vide au debut du test
- warm cache: cache deja rempli par un premier passage

Procedure recommandee:

```bash
# 1) vider Redis pour simuler un cold cache
redis-cli FLUSHDB

# 2) run 1 (cold cache)
k6 run tests/perf/fruit-load.js

# 3) run 2 (warm cache)
k6 run tests/perf/fruit-load.js
```

Si le cache est efficace, le second run doit en general afficher un `p(95)` plus bas.