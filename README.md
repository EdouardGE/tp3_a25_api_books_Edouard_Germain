# tp3_a25_api_books_Edouard_Germain — API + Front (Vue)

## Prérequis
- Node.js
- npm
- MongoDB (local ou Atlas)

---

## Installation

### 1 Backend
```bash
cd backend
npm install
```

### 2 Frontend (Vue)
```bash
cd ../frontend/vue-library
npm install
```
Frontend (Vue)
cd ../frontend/vue-library
npm install

Configuration (.env)
Backend

Créer backend/.env puis configurer les variables.

Exemple :

PORT=3000
MONGO_URI=mongodb://localhost:27017/tp3_a25
JWT_SECRET=change-moi


Mot de passe des utilisateurs de test (seed) : 123123

Frontend

Créer frontend/vue-library/.env :

VITE_API_URL=http://localhost:3000

Démarrage
Lancer le backend
cd backend
npm run dev


API : http://localhost:3000

Lancer le frontend
cd ../frontend/vue-library
npm run dev


Front (par défaut) : http://localhost:5173

Seed (données de test)

Pour peupler la base :

GET http://localhost:3000/db/seed

Tests Postman (collection)

La collection Postman exportée se trouve à la racine du projet :

TP3_A25_Postman_Collection.json

Documentation Postman (Publish)

URL de la documentation Postman :

https://documenter.getpostman.com/view/48829020/2sB3dSRpUm


