# 🚀 Deployment Guide - Google Cloud Platform

## **Prerequisites**

1. Google Cloud account with billing enabled
2. `gcloud` CLI installed
3. Docker installed locally
4. Project files ready

---

## **Step 1: Create GCP Project**

```bash
gcloud projects create farmer-assist --name="Farmer Assist"
gcloud config set project farmer-assist
gcloud auth login
```

---

## **Step 2: Enable Required APIs**

```bash
gcloud services enable \
  compute.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  run.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com
```

---

## **Step 3: Set Up PostgreSQL Database**

```bash
# Create Cloud SQL instance
gcloud sql instances create farmer-assist-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --availability-type=regional

# Create database
gcloud sql databases create farmer_assist \
  --instance=farmer-assist-db

# Create user
gcloud sql users create postgres \
  --instance=farmer-assist-db \
  --password
```

Get connection string:
```bash
gcloud sql instances describe farmer-assist-db \
  --format='value(connectionName)'
# Output: project:region:instance-name
```

---

## **Step 4: Configure Environment Variables**

Store secrets in Google Secret Manager:

```bash
echo "your-jwt-secret" | gcloud secrets create JWT_SECRET --data-file=-
echo "your-otp-secret" | gcloud secrets create OTP_SECRET --data-file=-
echo "your-twilio-token" | gcloud secrets create TWILIO_AUTH_TOKEN --data-file=-
echo "postgresql://user:password@/dbname?host=/cloudsql/project:region:instance" | \
  gcloud secrets create DATABASE_URL --data-file=-
```

---

## **Step 5: Create Dockerfile**

```dockerfile
# filepath: c:\Documents\farmerAssist\Dockerfile
FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```

---

## **Step 6: Create requirements.txt**

```bash
# From your backend directory
pip freeze > requirements.txt
```

Add these if missing:
```
fastapi==0.109.0
uvicorn==0.27.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
python-jose==3.3.0
bcrypt==4.1.1
twilio==8.10.0
google-cloud-secret-manager==2.16.4
google-genai==0.3.0
python-dotenv==1.0.0
```

---

## **Step 7: Build & Push Docker Image**

```bash
# Set up Artifact Registry
gcloud artifacts repositories create farmer-assist \
  --repository-format=docker \
  --location=us-central1

# Configure Docker auth
gcloud auth configure-docker us-central1-docker.pkg.dev

# Build image
docker build -t us-central1-docker.pkg.dev/farmer-assist/farmer-assist/backend:latest .

# Push to registry
docker push us-central1-docker.pkg.dev/farmer-assist/farmer-assist/backend:latest
```

---

## **Step 8: Deploy to Cloud Run**

```bash
gcloud run deploy farmer-assist-backend \
  --image us-central1-docker.pkg.dev/farmer-assist/farmer-assist/backend:latest \
  --platform managed \
  --region us-central1 \
  --memory 1Gi \
  --cpu 1 \
  --timeout 3600 \
  --set-env-vars DATABASE_URL="postgresql://user:password@cloudsql-proxy/farmer_assist" \
  --add-cloudsql-instances project:region:instance-name \
  --allow-unauthenticated
```

---

## **Step 9: Configure Cloud SQL Proxy**

Create `cloud-sql-proxy` sidecar in Cloud Run:

```bash
gcloud run deploy farmer-assist-backend \
  --image us-central1-docker.pkg.dev/farmer-assist/farmer-assist/backend:latest \
  --platform managed \
  --region us-central1 \
  --add-cloudsql-instances farmer-assist:us-central1:farmer-assist-db \
  --set-env-vars DATABASE_URL="postgresql://postgres:PASSWORD@127.0.0.1/farmer_assist"
```

---

## **Step 10: Set Up Load Balancer (Optional)**

```bash
gcloud compute backend-services create farmer-assist-backend \
  --global \
  --protocol HTTP \
  --port-name http

gcloud compute url-maps create farmer-assist-lb \
  --default-service=farmer-assist-backend

gcloud compute target-http-proxies create farmer-assist-proxy \
  --url-map=farmer-assist-lb

gcloud compute forwarding-rules create farmer-assist-rule \
  --global \
  --target-http-proxy=farmer-assist-proxy \
  --address-region=us-central1 \
  --ports=80
```

---

## **Step 11: Monitor & Logs**

```bash
# View logs
gcloud run logs read farmer-assist-backend --limit 50

# Monitor metrics
gcloud monitoring dashboards create --config-from-file=dashboard.yaml

# Set up alerting
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="High Error Rate"
```

---

## **Step 12: CI/CD Pipeline (Cloud Build)**

Create `cloudbuild.yaml`:

```yaml
# filepath: cloudbuild.yaml
steps:
  # Build
  - name: 'gcr.io/cloud-builders/docker'
    args: 
      - 'build'
      - '-t'
      - 'us-central1-docker.pkg.dev/$PROJECT_ID/farmer-assist/backend:$SHORT_SHA'
      - '.'
  
  # Push
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - 'us-central1-docker.pkg.dev/$PROJECT_ID/farmer-assist/backend:$SHORT_SHA'
  
  # Deploy
  - name: 'gcr.io/cloud-builders/gke-deploy'
    args:
      - run
      - --filename=k8s/
      - --image=us-central1-docker.pkg.dev/$PROJECT_ID/farmer-assist/backend:$SHORT_SHA
      - --location=us-central1
      - --cluster=farmer-assist-cluster

images:
  - 'us-central1-docker.pkg.dev/$PROJECT_ID/farmer-assist/backend:$SHORT_SHA'
```

---

## **Troubleshooting**

| Issue | Solution |
|-------|----------|
| **Database connection fails** | Ensure Cloud SQL proxy is running, check IAM permissions |
| **Container won't start** | View logs: `gcloud run logs read SERVICE_NAME` |
| **Out of memory** | Increase `--memory` flag in `gcloud run deploy` |
| **Secrets not loading** | Grant Secret Accessor role: `gcloud projects add-iam-policy-binding` |

---

## **Cost Estimation (Monthly)**

| Service | Cost |
|---------|------|
| Cloud Run (1M requests) | ~$5 |
| Cloud SQL (db-f1-micro) | ~$10 |
| Networking | ~$2 |
| **Total** | **~$17** |

---

## **Production Checklist**

- [ ] Enable HTTPS/SSL certificate
- [ ] Set up custom domain
- [ ] Configure Cloud CDN for static assets
- [ ] Enable Cloud Armor DDoS protection
- [ ] Set up backup policies for Cloud SQL
- [ ] Configure VPC for private database access
- [ ] Enable audit logging
- [ ] Set resource quotas
