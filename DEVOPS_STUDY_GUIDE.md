# 📘 BelleShop Master DevOps & Platform Engineering Handbook
### *A Production-Grade Reference for Cloud-Native Architecture, CI/CD, Kubernetes, GitOps, SRE, and IaC in E-Commerce*

---

## 📑 Table of Contents
1. [The Platform Engineering Philosophy in E-Commerce](#1-the-platform-engineering-philosophy-in-e-commerce)
2. [Containerization & Docker Engineering Deep-Dive](#2-containerization--docker-engineering-deep-dive)
3. [Storage, State & Data Persistence Strategies](#3-storage-state--data-persistence-strategies)
4. [CI/CD & DevSecOps Pipelines (GitHub Actions)](#4-cicd--devsecops-pipelines-github-actions)
5. [Kubernetes (K8s) Cluster Architecture & Manifest Hardening](#5-kubernetes-k8s-cluster-architecture--manifest-hardening)
6. [GitOps & Progressive Delivery (ArgoCD & Argo Rollouts)](#6-gitops--progressive-delivery-argocd--argo-rollouts)
7. [Observability & Site Reliability Engineering (SRE)](#7-observability--site-reliability-engineering-sre)
8. [Infrastructure as Code (IaC) with Terraform & Cloud Infrastructure](#8-infrastructure-as-code-iac-with-terraform--cloud-infrastructure)
9. [Real-World E-Commerce Incident Playbooks & Failure Modes](#9-real-world-e-commerce-incident-playbooks--failure-modes)
10. [Senior Platform Engineer Interview Master Bank](#10-senior-platform-engineer-interview-master-bank)

---

# 1. The Platform Engineering Philosophy in E-Commerce

### 1.1 The Business Context: High Velocity vs. Zero Revenue Loss
In an e-commerce platform like **BelleShop**, downtime translates directly to lost revenue and reputational damage.
* **$10,000 to $100,000+ per minute** is lost when checkout freezes during flash sales (e.g. Black Friday / Cyber Monday).
* If engineers cannot deploy fast, competitors win the market. If engineers deploy recklessly, payments break and customers leave.

### 1.2 The DevOps & Platform Solution
* **DevOps** breaks the wall between Development (pushing features) and Operations (maintaining stability) through shared ownership and automation.
* **Platform Engineering** builds the **Internal Developer Platform (IDP)**: the self-service tooling, automated pipelines, security guardrails, and cloud infrastructure that allow product developers to ship code to production safely with zero friction.

```
  ┌─────────────────────────────────────────────────────────────┐
  │                 INTERNAL DEVELOPER PLATFORM                 │
  ├──────────────────┬─────────────────────────┬────────────────┤
  │ Self-Service CI  │ Kubernetes Orchestration│ Observability  │
  │ (GitHub Actions) │ (GitOps / ArgoCD)       │ (Prometheus)   │
  └──────────────────┴─────────────────────────┴────────────────┘
                                 │
                                 ▼
                 [ BelleShop 3-Tier Microservices ]
                   - Next.js 15 Frontend (Port 3000)
                   - FastAPI Backend (Port 8000)
                   - MySQL 8.0 Database (Port 3306)
```

---

# 2. Containerization & Docker Engineering Deep-Dive

### 2.1 The Infrastructure Evolution: Bare Metal ➔ VMs ➔ Containers
```
 ┌────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
 │   Bare Metal   │      │     Virtual Machine     │      │        Container        │
 ├────────────────┤      ├─────────────────────────┤      ├─────────────────────────┤
 │  Application   │      │  App A   │    App B     │      │  App A   │    App B     │
 │  OS (Host)     │      │  Guest OS│    Guest OS  │      │  Bins/Lib│    Bins/Lib  │
 │  Hardware      │      │  Hypervisor (e.g. VMware│      │  Container Engine(Docker│
 └────────────────┘      │  Host OS │   Hardware   │      │  Host OS │   Hardware   │
                         └─────────────────────────┘      └─────────────────────────┘
```
* **Bare Metal:** 1 OS per physical server. Resulted in low hardware utilization (~15%) and high overhead.
* **Virtual Machines (VMs):** Multiple isolated OS instances on 1 physical host via a Hypervisor. Heavyweight (each VM requires 2-10GB of OS memory and takes minutes to boot).
* **Containers (Docker):** Lightweight execution environments sharing the host Linux kernel. Isolate user space using Linux **cgroups** (resource limits) and **namespaces** (process isolation). Boots in milliseconds.

---

### 2.2 Dockerfile Mechanics & Golden Rules

#### Rule 1: Layer Caching Optimization
Every instruction in a Dockerfile creates an immutable layer stacked sequentially.
* **Cache Invalidation Rule:** If layer $N$ is modified, Docker invalidates cache for layer $N$ and rebuilds every subsequent layer.
* **Optimization Pattern:** Order instructions from least frequently changed (base OS, dependencies) to most frequently changed (source code).

```dockerfile
# ❌ BAD: Modifying any .py file forces pip to re-download all dependencies
COPY . .
RUN pip install -r requirements.txt

# ✅ GOOD: Cached pip install layer is preserved when only source code changes
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
```

#### Rule 2: Multi-Stage Builds (The Scaffolding Pattern)
* Separate the build environment (compilers like `gcc`, `make`, development headers) from the final runtime container.
* **Benefits:** Drastically reduces image size (e.g., Next.js from 1.2GB down to 120MB) and shrinks the security attack surface by removing package managers and compilers from production.

#### Rule 3: Never Run as Root (Principle of Least Privilege)
* Containers default to `root` (`uid 0`). If an application suffers a Remote Code Execution (RCE) vulnerability, the attacker has root privileges inside the container namespace.
* **Production Fix:** Create a dedicated unprivileged user (`appuser` with UID `10001` or `nextjs` with UID `1001`) and declare `USER <username>`.

#### Rule 4: Real-time Logging Flags
* `PYTHONUNBUFFERED=1`: Ensures stdout/stderr stream directly to container logs in real-time without in-memory buffering.
* `PYTHONDONTWRITEBYTECODE=1`: Prevents Python from writing `.pyc` files, keeping container layers lean.

---

### 2.3 Hardened BelleShop Dockerfiles

#### Backend Dockerfile (`backend/Dockerfile`)
```dockerfile
# Stage 1: Build virtual environment with compilers
FROM python:3.12-slim AS builder
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential && rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Stage 2: Hardened, minimal runtime container
FROM python:3.12-slim AS runner
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PATH="/opt/venv/bin:$PATH"

# Create non-root user
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -s /sbin/nologin -d /app appuser

COPY --from=builder /opt/venv /opt/venv
COPY --chown=appuser:appgroup . .

USER appuser:appgroup
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Frontend Dockerfile (`frontend/Dockerfile`)
```dockerfile
# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build Next.js standalone bundle
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Minimal runner (120MB total size)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
RUN mkdir .next && chown nextjs:nodejs .next

# Standalone output bundle traces only needed node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

---

# 3. Storage, State & Data Persistence Strategies

### 3.1 Stateless vs. Stateful Workloads in E-Commerce

| Attribute | Stateless (Frontend & Backend API) | Stateful (Database & Search Index) |
| :--- | :--- | :--- |
| **Examples** | Next.js, FastAPI, Cart Service | MySQL 8.0, Redis, Elasticsearch |
| **Data Retention** | Ephemeral. Containers can be destroyed at any moment without data loss. | Persistent. Must survive crashes, container restarts, and host failures. |
| **Scaling Model** | Horizontally scale from 2 to 50 replicas in seconds based on CPU/traffic. | Requires careful replication (Primary/Replica) and dedicated storage volumes. |
| **Kubernetes Controller** | `Deployment` | `StatefulSet` |

---

### 3.2 Storage Approaches Comparison

```
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │ 1. Local Docker Volume (Single Node / Local Development)                    │
  │    - Path: `volumes: [ db_data:/var/lib/mysql ]`                            │
  │    - Pros: Instant setup, no cloud dependencies.                            │
  │    - Cons: Bound to single machine. Cannot be shared across servers.        │
  ├─────────────────────────────────────────────────────────────────────────────┤
  │ 2. Kubernetes PersistentVolumeClaim (In-Cluster Multi-Node Storage)         │
  │    - Managed by CSI (Container Storage Interface) e.g. AWS EBS, GCP PD.    │
  │    - Volume automatically detaches and reattaches if a Pod moves nodes.     │
  ├─────────────────────────────────────────────────────────────────────────────┤
  │ 3. Cloud Object Storage (Distributed Cloud Storage - AWS S3 / MinIO)        │
  │    - Storing product images, receipts, and invoices.                        │
  │    - 100% decoupling: Allows all 50 frontend/backend pods to access files.  │
  └─────────────────────────────────────────────────────────────────────────────┘
```

---

# 4. CI/CD & DevSecOps Pipelines (GitHub Actions)

### 4.1 The Pipeline Architecture
Our CI/CD pipeline enforces the **"Shift-Left" security model**, catching syntax errors, security vulnerabilities, and build breaks before code can reach `main`.

```
                  ┌─────────────────────────────────────────┐
                  │   Trigger: on push / pull_request       │
                  └────────────────────┬────────────────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            │ (Parallel VM 1)          │ (Parallel VM 2)          │ (Parallel VM 3)
            ▼                          ▼                          ▼
  ┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
  │  Job 1: Backend   │      │  Job 2: Frontend  │      │  Job 3: Security  │
  │  - Python 3.12    │      │  - Node.js 20     │      │  - Secret Scan    │
  │  - Dependency cache│     │  - npm ci         │      │  - Endpoint Safety│
  │  - Syntax & Tests │      │  - Lint & Build   │      │  - Trivy Scan     │
  └─────────┬─────────┘      └─────────┬─────────┘      └─────────┬─────────┘
            │                          │                          │
            └──────────────────────────┼──────────────────────────┘
                                       │ (All 3 Gatekeeper Jobs MUST Pass)
                                       ▼
                             ┌───────────────────┐
                             │  Job 4: Docker    │
                             │  Build & Package  │
                             │  (Docker Buildx)  │
                             └───────────────────┘
```

### 4.2 Key Pipeline Directives
1. **`concurrency: { group: ..., cancel-in-progress: true }`**:
   Cancels outdated runs when a developer pushes successive commits, preventing queue congestion and reducing GitHub Actions cloud costs.
2. **`needs: [backend-ci, frontend-ci, security-check]`**:
   Acts as a gatekeeper. Heavy Docker builds never execute if a basic test or linting error failed early.

---

# 5. Kubernetes (K8s) Cluster Architecture & Manifest Hardening

### 5.1 The 4 Core Building Blocks

```
   1. Pod         --> Smallest execution unit (wraps containers with shared network namespace)
   2. Deployment  --> Manages declarative rolling updates and horizontal scaling for stateless pods
   3. Service     --> Stable internal load balancer with persistent ClusterIP and DNS (e.g. backend:8000)
   4. Ingress     --> Cluster entry point routing external domain traffic (belleshop.com) to services
```

---

### 5.2 Deep-Dive: Probes & Self-Healing Mechanics

```
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │ 🩺 1. Liveness Probe ("Are you alive or deadlocked?")                       │
  │    - Failure Action: Kubelet KILLS the container and starts a fresh one.    │
  │    - E-Commerce Scenario: Detects an infinite loop in checkout processing.  │
  ├─────────────────────────────────────────────────────────────────────────────┤
  │ 🚦 2. Readiness Probe ("Can you accept customer traffic right now?")        │
  │    - Failure Action: K8s Service REMOVES the pod from load balancer pool.   │
  │    - E-Commerce Scenario: Prevents 502 Bad Gateway while MySQL connects.    │
  ├─────────────────────────────────────────────────────────────────────────────┤
  │ ⏳ 3. Startup Probe ("Are you still executing slow initial boot?")          │
  │    - Failure Action: Pauses liveness checks until initial startup succeeds. │
  │    - E-Commerce Scenario: Loading huge product cache into memory on boot.   │
  └─────────────────────────────────────────────────────────────────────────────┘
```

---

### 5.3 StatefulSet vs. Deployment for MySQL

Why we use a `StatefulSet` for MySQL instead of a `Deployment`:
1. **Stable Network Identity:** Pods receive deterministic names (`mysql-0`, `mysql-1`) rather than random strings (`mysql-7f8d9b-4k2lz`).
2. **Volume Attachment:** `volumeClaimTemplates` automatically binds a dedicated PersistentVolume to each specific replica index, preventing data corruption during pod relocation across nodes.

---

# 6. GitOps & Progressive Delivery (ArgoCD & Argo Rollouts)

### 6.1 Push-Based CI vs. Pull-Based GitOps

```
  Push-Based (Legacy):
  [ GitHub Actions ] ──( Stores Admin Kubeconfig )──► [ Public K8s API ]  ⚠️ (High security risk)

  Pull-Based (GitOps with ArgoCD):
  [ GitHub (Source of Truth) ] ◄──( Polling / Webhook )── [ ArgoCD in K8s ] ──► [ Local Pods ]
```

### 6.2 The ArgoCD Self-Healing Engine
* **`selfHeal: true`**: Reverts unauthorized changes made directly via `kubectl` to match Git within seconds.
* **`prune: true`**: Automatically deletes obsolete Kubernetes resources when deleted from the repository.

---

### 6.3 Progressive Delivery (Canary Releases with Argo Rollouts)
Instead of replacing 100% of pods at once, Argo Rollouts performs automated risk mitigation:
1. Shift **10% of real user traffic** to the new version.
2. Observe Prometheus metrics for 5 minutes:
   * Is HTTP 5xx error rate $< 0.5\%$?
   * Is p99 latency $< 250\text{ms}$?
3. If **Pass (✅)**: Shift traffic to 50%, then 100%.
4. If **Fail (❌)**: Instantly abort and rollback to stable version with **zero customer impact**.

---

# 7. Observability & Site Reliability Engineering (SRE)

### 7.1 The 3 Pillars of Observability
1. **Metrics (Numeric Aggregates):** CPU %, Memory usage, HTTP request count, error rates. Stored in **Prometheus**, visualized in **Grafana**.
2. **Logs (Event Records):** Text messages with timestamps. Aggregated in **Loki** / **Elasticsearch**.
3. **Distributed Traces (Request Journeys):** Visual spans tracking a transaction through Frontend ➔ Backend ➔ MySQL. Instrumented via **OpenTelemetry** and **Jaeger**.

---

### 7.2 The SRE Hierarchy: SLI, SLO, SLA

```
  ┌─────────────────────────────────────────────────────────────┐
  │ 1. SLI (Service Level Indicator) - "What is reality?"       │
  │    - Real-time measurement: 99.92% of checkouts succeeded.  │
  ├─────────────────────────────────────────────────────────────┤
  │ 2. SLO (Service Level Objective) - "What is our team goal?" │
  │    - Target: 99.9% success rate over rolling 30-day window. │
  ├─────────────────────────────────────────────────────────────┤
  │ 3. SLA (Service Level Agreement) - "Legal Contract"         │
  │    - Financial penalty: If uptime < 99.0%, refund 15% fee.  │
  └─────────────────────────────────────────────────────────────┘
```

### 7.3 The 4 Golden Signals Applied to E-Commerce
* **Latency:** Time to complete checkout transactions.
* **Traffic:** Total concurrent shoppers on the platform.
* **Errors:** Number of HTTP 500/502 errors occurring during payment.
* **Saturation:** MySQL connection pool utilization (e.g. 95/100 connections active).

---

# 8. Infrastructure as Code (IaC) with Terraform & Cloud Infrastructure

### 8.1 Why Terraform Over "ClickOps"?
* **ClickOps:** Manually creating VPCs and databases in the AWS/GCP web console. Causes configuration drift, lacks version control, and makes disaster recovery impossible.
* **Terraform:** Declarative, reproducible infrastructure saved as code in Git.

### 8.2 The Terraform 4-Step Lifecycle
1. `terraform init`: Initializes working directory, downloads cloud provider plugins (AWS, GCP, Azure, Kubernetes).
2. `terraform plan`: Dry-run execution preview showing resources to add, modify, or destroy.
3. `terraform apply`: Executes cloud API calls to provision the desired architecture.
4. `terraform destroy`: Safely tears down resources to prevent unwanted cloud costs.

---

### 8.3 State Management & Remote Locking
* **`terraform.tfstate`**: The map linking Terraform code declarations to physical cloud resource IDs.
* **The Golden Rule:** Never commit `.tfstate` to Git (contains unencrypted secrets and causes race conditions).
* **Production Setup:**
  * **Storage:** AWS S3 bucket with encryption and versioning.
  * **State Locking:** AWS DynamoDB table acting as a distributed mutex lock to prevent concurrent applies from corrupting state.

---

# 9. Real-World E-Commerce Incident Playbooks & Failure Modes

### Scenario 1: Black Friday Traffic Surge (Auto-Scaling Failure)
* **Symptom:** Latency increases from 150ms to 8,000ms. CPU on backend pods reaches 100%.
* **Root Cause:** Horizontal Pod Autoscaler (HPA) was missing resource requests on pods.
* **Resolution:** Configure `resources.requests.cpu` in Deployment manifests and enable HPA:
  ```bash
  kubectl autoscale deployment backend --cpu-percent=70 --min=3 --max=30 -n dev
  ```

### Scenario 2: MySQL Connection Pool Exhaustion (Saturation)
* **Symptom:** Frontend displays `500 Internal Server Error`, Backend logs show `mysql.connector.errors.PoolExhaustedError`.
* **Root Cause:** Microservices opening new database connections per request instead of pooling.
* **Resolution:** Deploy **ProxySQL** or **AWS RDS Proxy** to pool and multiplex database connections.

### Scenario 3: Broken Deployment Rollout (Instant Rollback)
* **Symptom:** New release passes tests but crashes on edge cases in production.
* **GitOps Resolution:**
  ```bash
  # GitOps way: Revert Git commit on main branch
  git revert HEAD
  git push origin main
  # ArgoCD automatically synchronizes and redeploys the previous stable state
  ```

---

# 10. Senior Platform Engineer Interview Master Bank

### Q1: *"How do you design a zero-downtime deployment strategy for an e-commerce platform?"*
> **Answer:** Combine Kubernetes **Rolling Updates** or **Argo Rollouts (Canary)** with hardened **Readiness Probes** and **PodDisruptionBudgets (PDB)**. The Readiness probe ensures user traffic is only routed to newly spawned pods once database connections and caches are verified. The PDB ensures a minimum percentage of healthy pods remain online during cluster upgrades.

### Q2: *"Why should MySQL database state NOT be stored on a container's local disk?"*
> **Answer:** Container filesystems are ephemeral by design. When a container crashes, restarts, or is rescheduled to another worker node, all data in its local writable layer is destroyed. We must attach a persistent storage volume (e.g. AWS EBS via a Kubernetes PVC and StatefulSet) or use a managed database service (e.g. AWS RDS Aurora) with automated backups and multi-AZ failover.

### Q3: *"How does GitOps prevent configuration drift?"*
> **Answer:** GitOps establishes the Git repository as the single source of truth for all desired cluster state. An in-cluster agent (ArgoCD) continuously executes a reconciliation loop comparing the live Kubernetes state against Git. If manual changes are made via `kubectl`, ArgoCD detects the drift and automatically overwrites the cluster back to the declarative state defined in Git.

### Q4: *"Explain the difference between Liveness, Readiness, and Startup probes."*
> **Answer:** Liveness probes determine if a container is alive or deadlocked; if it fails, the kubelet kills and restarts the container. Readiness probes determine if a container is ready to accept traffic; if it fails, the Kubernetes Service temporarily removes the pod from the load balancer pool without killing it. Startup probes protect slow-starting applications by pausing liveness checks until initial boot is complete.
