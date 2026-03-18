# ═══════════════════════════════════════════════════════════
#  ROOT MAIN.TF — Inter-Region Infrastructure
#
#  Terraform manages ONLY:
#    VPC, Monitoring VPC, VPC Peering, Security Groups,
#    ALB, RDS, DynamoDB, SQS, S3, SSM, CloudWatch
#
#  NOT managed by Terraform (create via AWS Console / CLI):
#    ECR repositories
#    ECS clusters, Task Definitions, ECS Services
# ═══════════════════════════════════════════════════════════

provider "aws" {
  region = var.aws_region   # us-east-1 (default)

  default_tags {
    tags = {
      Project     = "lks2026"
      Environment = "production"
      ManagedBy   = "Terraform"
    }
  }
}

provider "aws" {
  alias  = "oregon"
  region = var.monitoring_region   # us-west-2

  default_tags {
    tags = {
      Project     = "lks2026"
      Environment = "production"
      ManagedBy   = "Terraform"
    }
  }
}

# ── 1. Application VPC — us-east-1 ───────────────────────
module "vpc" {
  source = "./modules/vpc"

  vpc_name              = "lks-vpc"
  vpc_cidr              = var.vpc_cidr
  public_subnet_cidrs   = var.public_subnet_cidrs
  private_subnet_cidrs  = var.private_subnet_cidrs
  isolated_subnet_cidrs = var.isolated_subnet_cidrs
  availability_zones    = var.availability_zones
}

# ── 2. Monitoring VPC — us-west-2 (Oregon) ───────────────
module "monitoring_vpc" {
  source = "./modules/monitoring_vpc"
  providers = {
    aws = aws.oregon
  }

  vpc_name           = "lks-monitoring-vpc"
  vpc_cidr           = var.monitoring_vpc_cidr
  subnet_cidrs       = var.monitoring_subnet_cidrs
  availability_zones = var.monitoring_availability_zones
  aws_region         = var.monitoring_region
}

# ── 3. Inter-Region VPC Peering ──────────────────────────
module "vpc_peering" {
  source = "./modules/vpc_peering"
  providers = {
    aws        = aws
    aws.oregon = aws.oregon
  }

  peering_name             = "pcx-lks-2026"
  requester_vpc_id         = module.vpc.vpc_id
  accepter_vpc_id          = module.monitoring_vpc.vpc_id
  requester_route_table_id = module.vpc.private_route_table_id
  accepter_route_table_id  = module.monitoring_vpc.private_route_table_id
  requester_cidr           = var.vpc_cidr
  accepter_cidr            = var.monitoring_vpc_cidr
  peer_region              = var.monitoring_region
  peer_owner_id            = var.aws_account_id

  depends_on = [module.vpc, module.monitoring_vpc]
}

# ── 4. Security Groups — us-east-1 ───────────────────────
module "security" {
  source = "./modules/security"

  vpc_id              = module.vpc.vpc_id
  monitoring_vpc_cidr = var.monitoring_vpc_cidr
}

# ── 5. Application Load Balancer — us-east-1 ─────────────
module "alb" {
  source = "./modules/alb"

  alb_name          = "lks-alb"
  public_subnet_ids = module.vpc.public_subnet_ids
  security_group_id = module.security.sg_alb_id
  vpc_id            = module.vpc.vpc_id
}

# ── 6. Databases — us-east-1 isolated subnet ─────────────
module "database" {
  source = "./modules/database"

  vpc_id              = module.vpc.vpc_id
  isolated_subnet_ids = module.vpc.isolated_subnet_ids
  security_group_id   = module.security.sg_db_id

  db_name           = var.db_name
  db_username       = var.db_username
  db_password       = var.db_password
  db_instance_class = var.db_instance_class

  sqs_queue_name = "lks-event-queue"
  dlq_name       = "lks-dlq"
  dynamo_table   = "lks-sessions"

  # S3 buckets
  tfstate_bucket_name = "lks-tfstate-${var.student_name}-2026"
  assets_bucket_name  = "lks-app-assets-${var.student_name}-2026"
}

# ── NOTE: ECR and ECS are NOT managed by Terraform ───────
# Create them manually via AWS Console or CLI.
# See Section 8 (ECR) and Section 10 (ECS) in the module document.
# After ECS tasks are running, retrieve their private IPs and
# update monitoring/prometheus/prometheus.yml before deploying
# the monitoring stack.
