# Repository Setup Guide — LKS 2026 (3-Hour + Prometheus)

Two AWS regions:
- **us-east-1 (N. Virginia)** — Application VPC, ECS app cluster, RDS, ALB
- **us-west-2 (Oregon)**     — Monitoring VPC, Prometheus ECS service

Terraform manages: VPC, Security Groups, ALB, RDS, DynamoDB, S3, Monitoring VPC, VPC Peering.
**ECR and ECS are created manually** via AWS Console or CLI.

---

## Step 1 — Push to GitHub

```bash
cd infralks26
git init
git add .
git commit -m "Initial commit — LKS 2026"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/infralks26.git
git push -u origin main
```

---

## Step 2 — Add collaborator

Settings → Collaborators → Add: `handipradana` (Write access)

---

## Step 3 — Configure GitHub Secrets

Settings → Secrets and Variables → Actions → New repository secret

| Secret Name | Value |
|---|---|
| `AWS_ACCESS_KEY_ID` | From AWS Academy → AWS Details |
| `AWS_SECRET_ACCESS_KEY` | From AWS Academy → AWS Details |
| `AWS_SESSION_TOKEN` | From AWS Academy — **update every session** |
| `AWS_REGION` | `us-east-1` |
| `MONITORING_REGION` | `us-west-2` |
| `AWS_ACCOUNT_ID` | 12-digit account ID |
| `ECR_REGISTRY` | `<ID>.dkr.ecr.us-east-1.amazonaws.com` |
| `ECR_REGISTRY_OREGON` | `<ID>.dkr.ecr.us-west-2.amazonaws.com` |
| `TF_STATE_BUCKET` | `lks-tfstate-yourname-2026` |
| `STUDENT_NAME` | Your name (used in S3 bucket naming) |

---

## Step 4 — Create S3 state bucket (us-east-1, one-time)

```bash
aws s3 mb s3://lks-tfstate-yourname-2026 --region us-east-1
aws s3api put-bucket-versioning \
  --bucket lks-tfstate-yourname-2026 \
  --versioning-configuration Status=Enabled
```

---

## Step 5 — Create ECR repositories MANUALLY

Three repositories total: two in us-east-1, one in us-west-2.

```bash
# Application — us-east-1
aws ecr create-repository --repository-name lks-fe-app \
  --region us-east-1 --image-tag-mutability MUTABLE \
  --image-scanning-configuration scanOnPush=true

aws ecr create-repository --repository-name lks-api-app \
  --region us-east-1 --image-tag-mutability MUTABLE \
  --image-scanning-configuration scanOnPush=true

# Prometheus — us-west-2 (Oregon)
# Fargate in Oregon cannot pull from ECR in Virginia
aws ecr create-repository --repository-name lks-prometheus \
  --region us-west-2 --image-tag-mutability MUTABLE \
  --image-scanning-configuration scanOnPush=true
```

---

## Step 6 — Write Terraform modules and push

Each module folder has a README.md. Write the `.tf` files, then:

```bash
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
# Edit terraform.tfvars with your account ID and student name

git add .
git commit -m "Add Terraform modules"
git push origin main
```

This triggers the CI/CD pipeline. All 4 jobs should go green.

---

## Step 7 — Create ECS clusters MANUALLY (after Terraform apply)

Get subnet and SG IDs from Terraform output, then in the AWS Console:

**Application cluster (us-east-1):**
1. ECS → Clusters → Create → `lks-ecs-cluster` → Fargate → Container Insights on
2. Task Definition: `lks-fe-task` → FARGATE, port 3000, image `lks-fe-app:latest`
3. Task Definition: `lks-api-task` → FARGATE, port 8080, image `lks-api-app:latest`
4. Service: `lks-fe-service` → attach to `lks-tg-fe`
5. Service: `lks-api-service` → attach to `lks-tg-api`

**Monitoring cluster (us-west-2):**
1. ECS → Clusters → Create → `lks-monitoring-cluster` → Fargate
2. Task Definition: `lks-prometheus-task` → FARGATE, port 9090
   - Image: `<ID>.dkr.ecr.us-west-2.amazonaws.com/lks-prometheus:latest`
   - Use LabRole for both execution and task role
3. Service: `lks-prometheus-service`
   - Subnets: monitoring private subnets (from terraform output)
   - Security Group: lks-sg-monitoring (from terraform output)
   - Assign Public IP: DISABLED

---

## Step 8 — Update Prometheus config with real ECS IPs

After ECS app services are running:

```bash
# Get private IPs of ECS tasks in us-east-1
aws ecs describe-tasks \
  --cluster lks-ecs-cluster \
  --region us-east-1 \
  --tasks $(aws ecs list-tasks \
    --cluster lks-ecs-cluster \
    --region us-east-1 \
    --output text --query 'taskArns[]') \
  --query 'tasks[].attachments[].details[?name==`privateIPv4Address`].value[]' \
  --output text
```

Edit `monitoring/prometheus/prometheus.yml` — replace `10.0.3.10` and `10.0.3.11`
with the actual IPs. Then push to GitHub to rebuild the Prometheus image:

```bash
git add monitoring/prometheus/prometheus.yml
git commit -m "Update Prometheus scrape targets with real ECS IPs"
git push origin main
```

After the pipeline completes, force a new deployment of the Prometheus ECS service
so it picks up the updated image.

---

## Step 9 — Verify Prometheus Targets

Open Prometheus UI (port 9090) and check Status → Targets.

All three targets should show State: **UP**:
- prometheus (localhost)
- lks-api-service (10.0.3.x:9100)
- lks-fe-service (10.0.3.x:9100)

**Targets UP = Inter-Region VPC Peering is working correctly.**

---

## Verification commands

```bash
# Peering status
aws ec2 describe-vpc-peering-connections \
  --filters Name=tag:Name,Values=pcx-lks-2026 \
  --region us-east-1 \
  --query 'VpcPeeringConnections[0].Status.Code'
# Expected: "active"

# Application health check via ALB
curl http://$(cd terraform && terraform output -raw alb_dns_name)/api/health

# Prometheus targets (from inside Prometheus container or via port-forward)
curl http://<prometheus-task-ip>:9090/api/v1/targets \
  | jq '.data.activeTargets[] | {job: .labels.job, health: .health}'
```
