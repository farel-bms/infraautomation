terraform {
  required_version = ">= 1.8.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    # Values supplied at runtime by CI/CD pipeline:
    #   terraform init \
    #     -backend-config="bucket=lks-tfstate-yourname-2026" \
    #     -backend-config="key=prod/terraform.tfstate"      \
    #     -backend-config="region=us-east-1"
  }
}

# ── Provider 1: us-east-1 (Application region) ───────────
provider "aws" {
  alias  = "requester"
  region = var.requester_region   # us-east-1

  default_tags {
    tags = {
      Project     = "lks2026"
      Environment = "production"
      ManagedBy   = "Terraform"
    }
  }
}

# ── Provider 2: ap-southeast-1 (Monitoring region) ───────
provider "aws" {
  alias  = "accepter"
  region = var.accepter_region   # ap-southeast-1

  default_tags {
    tags = {
      Project     = "lks2026"
      Environment = "production"
      ManagedBy   = "Terraform"
    }
  }
}

# ── Default provider (for resources that don't specify) ───
# Points to the requester region (us-east-1) so most resources
# work without needing an explicit provider = aws.requester argument.
provider "aws" {
  region = var.requester_region

  default_tags {
    tags = {
      Project     = "lks2026"
      Environment = "production"
      ManagedBy   = "Terraform"
    }
  }
}
