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