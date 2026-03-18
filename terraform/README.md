# Terraform — LKS 2026 Infrastructure as Code

Terraform manages the core AWS infrastructure for this project.
**ECR and ECS are NOT managed by Terraform** — create them manually via the AWS Console or CLI.

## What Terraform manages

| Module | Resources |
|---|---|
| `modules/vpc/` | lks-vpc, 6 subnets, IGW, NAT Gateway, route tables |
| `modules/monitoring_vpc/` | lks-monitoring-vpc (us-west-2), private subnets, VPC Endpoints |
| `modules/vpc_peering/` | Inter-region peering connection + route table updates |
| `modules/security/` | lks-sg-alb, lks-sg-ecs, lks-sg-db, lks-sg-monitoring |
| `modules/alb/` | Application Load Balancer, Target Groups, Listener Rules |
| `modules/database/` | RDS PostgreSQL, DynamoDB, SQS, S3 buckets, SSM Parameters, CloudWatch |

## What is NOT managed by Terraform

| Service | How to create |
|---|---|
| ECR repositories | AWS Console or `aws ecr create-repository` CLI |
| ECS clusters | AWS Console — ECS → Create Cluster |
| ECS Task Definitions | AWS Console — ECS → Task Definitions |
| ECS Services | AWS Console — ECS → Services |

## Quick start

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

terraform init \
  -backend-config="bucket=lks-tfstate-yourname-2026" \
  -backend-config="key=prod/terraform.tfstate" \
  -backend-config="region=us-east-1"

terraform plan
terraform apply
```

After apply, run `terraform output` to get the subnet IDs, security group IDs,
and ALB Target Group ARNs you need when creating ECS services in the Console.
