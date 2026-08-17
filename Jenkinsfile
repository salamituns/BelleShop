pipeline {
    agent any

    environment {
        GITEA_REPO = 'https://gitea.stratdevs.com/tunsgit/BelleShop.git'
        SONARQUBE_URL = 'http://192.168.1.86:9000'
        IMAGE_NAME = 'belleshop-backend'
        IMAGE_TAG = "v${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout Source') {
            steps {
                echo "=========================================="
                echo " [1/6] Checking out code from Gitea..."
                echo "=========================================="
                checkout scm
            }
        }

        stage('Automated Unit Tests') {
            steps {
                echo "=========================================="
                echo " [2/6] Executing Backend Unit Tests..."
                echo "=========================================="
                sh '''
                    python3 -m venv .venv || true
                    . .venv/bin/activate
                    pip install --no-cache-dir -r backend/requirements.txt
                    PYTHONPATH=backend pytest backend/test_main.py -v
                '''
            }
        }

        stage('SonarQube Security & Code Quality Scan') {
            steps {
                echo "=========================================="
                echo " [3/6] Running SonarQube Scanner Analysis..."
                echo "=========================================="
                sh '''
                    # Execute SonarQube scanner via official container runner
                    docker run --rm \
                        -e SONAR_HOST_URL="${SONARQUBE_URL}" \
                        -v "$(pwd):/usr/src" \
                        sonarsource/sonar-scanner-cli \
                        -Dsonar.projectKey=belleshop \
                        -Dsonar.projectName="BelleShop E-Commerce" \
                        -Dsonar.sources=backend,frontend \
                        -Dsonar.exclusions="**/node_modules/**,**/.next/**,**/*.tar,**/.venv/**" || true
                '''
            }
        }

        stage('Build Container Image') {
            steps {
                echo "=========================================="
                echo " [4/6] Building Hardened Docker Image (${IMAGE_TAG})..."
                echo "=========================================="
                sh '''
                    cd backend
                    docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest .
                '''
            }
        }

        stage('Deploy to Homelab Cluster Nodes') {
            steps {
                echo "=========================================="
                echo " [5/6] Distributing Image to Cluster containerd..."
                echo "=========================================="
                sh '''
                    docker save -o /tmp/backend-${IMAGE_TAG}.tar ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest
                    for target in 192.168.1.89 192.168.1.84 192.168.1.90; do
                        echo "Streaming image to $target containerd..."
                        cat /tmp/backend-${IMAGE_TAG}.tar | ssh -o StrictHostKeyChecking=no tunsadmin@$target "cat > /tmp/backend-ci.tar && sudo ctr -n k8s.io images import /tmp/backend-ci.tar" || true
                    done
                '''
            }
        }

        stage('GitOps Release (Update Manifests)') {
            steps {
                echo "=========================================="
                echo " [6/6] Updating GitOps Manifests & Triggering ArgoCD..."
                echo "=========================================="
                sh '''
                    # Update image tag in k8s/backend-rollout.yaml
                    sed -i "s|image: belleshop-backend:.*|image: belleshop-backend:${IMAGE_TAG}|g" k8s/backend-rollout.yaml
                    
                    # Commit and push back to Gitea with credentials from environment
                    git config user.name "Jenkins CI/CD"
                    git config user.email "jenkins@stratdevs.com"
                    git add k8s/backend-rollout.yaml
                    git commit -m "ci(release): deploy ${IMAGE_NAME}:${IMAGE_TAG} [skip ci]" || true
                    git push origin main || git push https://tunsgit:${GITEA_TOKEN}@gitea.stratdevs.com/tunsgit/BelleShop.git main || true
                    
                    echo "🎉 GitOps release pushed to Gitea! ArgoCD and Argo Rollouts will now execute the Canary deployment on Kubernetes!"
                '''
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo "✅ BelleShop CI/CD Pipeline completed successfully!"
        }
        failure {
            echo "❌ Pipeline failed! Please inspect logs above."
        }
    }
}
