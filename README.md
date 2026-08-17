# BelleShop

A modern, multi-tier e-commerce webapp built with:
- **Frontend:** Next.js (TypeScript)
- **Backend:** FastAPI (Python)
- **Database:** MySQL
- **DevOps:** Docker Compose & Kubernetes

---

## Project Structure

```
/BelleShop
  /frontend      # Next.js app
  /backend       # FastAPI app (with JWT auth)
  /db            # MySQL init scripts
  /k8s           # Kubernetes manifests
  docker-compose.yml
  guide.md       # DevOps/GitOps workflow
  README.md
```

---

## 🚀 Quick Start (Local Development)

1. **Clone the repo:**
   ```bash
   git clone <your-repo-url>
   cd BelleShop
   ```
2. **Start all services:**
   ```bash
   docker-compose up --build
   ```
3. **Access the app:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API docs: [http://localhost:8000/docs](http://localhost:8000/docs)
   - MySQL: localhost:3306 (user: root, password: password)

---

## 🛠️ Stack Details

- **Frontend:** Next.js (TypeScript, npm)
- **Backend:** FastAPI (Python 3.12, JWT auth, MySQL connector)
- **Database:** MySQL 8 (with `users` table auto-created)
- **DevOps:**
  - Docker Compose for local orchestration
  - Kubernetes manifests in `/k8s` for cloud-native deployment

---

## 🧑‍💻 Development

- Frontend code: `/frontend`
- Backend code: `/backend`
- DB init scripts: `/db/init.sql`
- Add new microservices as needed in their own folders

---

## ☸️ Kubernetes

Kubernetes manifests are in `/k8s`. See `guide.md` for full GitOps/ArgoCD workflow.

---

## 📄 License

MIT (or your preferred license) 