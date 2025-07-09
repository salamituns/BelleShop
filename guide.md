## ✅ Local DevOps + GitOps Lab Guide with Kind, GitHub, CI/CD, and ArgoCD

### 📌 Goal

Run a full end-to-end application deployment pipeline **locally** using **Kind**, **GitHub**, **GitHub Actions**, **ArgoCD**, and **Prometheus/Grafana**.

---

## 🗂️ 1️⃣ Prerequisites

- Docker installed
- Kind installed (`kind create cluster` works)
- kubectl installed
- Git & GitHub account

---

## 📁 2️⃣ Project Structure

```
webapp/
│
├── Dockerfile
├── app source code (index.html, app.py, etc.)
├── k8s/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── namespace.yaml (optional)
└── .github/
    └── workflows/
        └── ci.yml
```

---

## ⚙️ 3️⃣ Build & Test Locally

```bash
docker build -t my-webapp:dev .
docker run -p 8080:8080 my-webapp:dev
```

Visit `http://localhost:8080` to verify it works.

---

## 🔀 4️⃣ Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

---

## ⚡ 5️⃣ Create GitHub Actions Pipeline

Example `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build -t your-dockerhub-username/webapp:latest .

      - name: Login to Docker Hub
        run: echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin

      - name: Push Docker image
        run: docker push your-dockerhub-username/webapp:latest
```

Add your Docker credentials to your GitHub repo secrets.

---

## ⚙️ 6️⃣ Create Kind Cluster

```bash
kind create cluster --name dev-cluster
kubectl create namespace dev
kubectl create namespace qa
kubectl create namespace stage
kubectl create namespace prod
```

---

## 🚀 7️⃣ Deploy App to Kind (First Time)

Update `deployment.yaml`:

```yaml
image: your-dockerhub-username/webapp:latest
```

Apply:

```bash
kubectl apply -f k8s/deployment.yaml -n dev
kubectl apply -f k8s/service.yaml -n dev
```

Verify:

```bash
kubectl get pods -n dev
kubectl get svc -n dev
```

---

## 🔗 8️⃣ Install ArgoCD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Login at `http://localhost:8080` — default user: `admin`.

Get initial password:

```bash
kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d
```

Add your GitHub repo → create ArgoCD App → point to `k8s/` manifests.

✅ ArgoCD now watches your repo & auto-syncs changes.

---

## 📈 9️⃣ Add Monitoring with Prometheus & Grafana

```bash
kubectl create namespace monitoring
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring

kubectl port-forward svc/prometheus-grafana -n monitoring 3000:80
```

Access Grafana at `http://localhost:3000` (default creds: `admin/admin`).

---

## 🔁 10️⃣ Branches = Environments

Use branches:

- `main` → prod
- `develop` → dev
- `qa` → qa
- `stage` → stage

Use different namespaces or kustomization overlays. ArgoCD maps each branch to a namespace.

---

## ✅ 11️⃣ Full DevOps Loop

1. Develop code → push to GitHub.
2. GitHub Actions builds & pushes image.
3. Manifests point to latest image tag.
4. ArgoCD detects change → deploys to Kind.
5. Prometheus & Grafana monitor health.
6. Repeat!

Same flow works with real cloud later.

---

## 🔑 Tips

- Keep `kubectl` context on your Kind cluster.
- Automate image tags with your pipeline.
- Use `NodePort` or Ingress for local access.
- Expand: Add Loki for logs, Jaeger for tracing.

---

## 🚀 Done!

You now have a **self-contained, no-cost cloud-native pipeline lab**.

**Next:** Deploy same pipeline to real AWS/GKE/EKS when you’re ready!

