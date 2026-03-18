# Module: monitoring_vpc

Provisions `lks-monitoring-vpc` in **us-west-2 (Oregon)** — a different region
from the application VPC in us-east-1 (Virginia).

## Key differences from same-region deployment

- **Separate AWS provider alias** — all resources in this module use a dedicated
  `aws.oregon` provider alias. See provider alias pattern below.
- **VPC Endpoints use us-west-2 service names** — not us-east-1.
- **No internet access** — no IGW, no NAT. All AWS service traffic via VPC Endpoints.
- **ECR must exist in us-west-2** — Fargate in Oregon cannot pull from ECR in
  Virginia. The CI/CD pipeline must push to ECR in both regions.

## Resources to create (all in us-west-2)

- `aws_vpc` — lks-monitoring-vpc, CIDR 10.1.0.0/16, DNS enabled
- `aws_subnet` x 2 — private subnets in us-west-2a and us-west-2b
- `aws_route_table` — lks-monitoring-rt (no internet route)
- `aws_route_table_association` x 2

### VPC Endpoints (us-west-2 service names)

- Interface: `com.amazonaws.us-west-2.ecr.api`
- Interface: `com.amazonaws.us-west-2.ecr.dkr`
- Interface: `com.amazonaws.us-west-2.logs`
- Gateway:   `com.amazonaws.us-west-2.s3`

## Provider alias pattern (in terraform/main.tf)

```hcl
provider "aws" {
  alias  = "oregon"
  region = "us-west-2"
}

module "monitoring_vpc" {
  source = "./modules/monitoring_vpc"
  providers = { aws = aws.oregon }
  ...
}

module "monitoring" {
  source = "./modules/monitoring"
  providers = { aws = aws.oregon }
  ...
}
```

## Required inputs

| Variable | Type | Description |
|---|---|---|
| `vpc_name` | string | "lks-monitoring-vpc" |
| `vpc_cidr` | string | "10.1.0.0/16" |
| `subnet_cidrs` | list(string) | ["10.1.1.0/24", "10.1.2.0/24"] |
| `availability_zones` | list(string) | ["us-west-2a", "us-west-2b"] |
| `aws_region` | string | "us-west-2" |

## Required outputs

| Output | Description |
|---|---|
| `vpc_id` | Used by vpc_peering as peer_vpc_id |
| `subnet_ids` | Used by monitoring ECS module |
| `private_route_table_id` | Used by vpc_peering module |
| `region` | Used by vpc_peering as peer_region |
