# Module: vpc_peering (Inter-Region)

Creates a VPC Peering Connection between:
- **Requester**: lks-vpc in us-east-1 (N. Virginia)
- **Accepter**:  lks-monitoring-vpc in us-west-2 (Oregon)

## How inter-region peering differs from same-region

| Feature | Same-region | Inter-region |
|---|---|---|
| `peer_region` argument | Not needed | **Required** |
| `auto_accept` | Works | **Does NOT work** — must accept manually or via separate resource |
| DNS resolution | Supported | **NOT supported** — use private IP addresses only |
| Traffic encryption | Optional | **Automatic** — encrypted by AWS at no extra config |
| Data transfer cost | Free | ~$0.02/GB cross-region |
| Latency | <1ms | ~60-80ms Virginia ↔ Oregon |

## Resources to create

### Step 1 — Peering Connection (us-east-1 provider)

```hcl
resource "aws_vpc_peering_connection" "this" {
  vpc_id        = var.requester_vpc_id   # lks-vpc (us-east-1)
  peer_vpc_id   = var.accepter_vpc_id    # lks-monitoring-vpc (us-west-2)
  peer_region   = var.peer_region        # "us-west-2"  ← REQUIRED for inter-region
  peer_owner_id = var.peer_owner_id      # AWS account ID

  # auto_accept CANNOT be set for inter-region peering
  # The connection starts in "pending-acceptance" state

  tags = { Name = var.peering_name }
}
```

### Step 2 — Accept the connection (us-west-2 provider)

Because the accepter is in a different region, a separate resource using
the `aws.oregon` provider alias must accept the peering:

```hcl
resource "aws_vpc_peering_connection_accepter" "this" {
  provider                  = aws.oregon
  vpc_peering_connection_id = aws_vpc_peering_connection.this.id
  auto_accept               = true

  tags = { Name = "${var.peering_name}-accepter" }
}
```

### Step 3 — DNS resolution options

**DNS resolution is NOT supported for inter-region VPC Peering.**
Do NOT create `aws_vpc_peering_connection_options` with DNS enabled —
it will throw an error. Prometheus must use private IP addresses
directly to reach ECS tasks. Use AWS Cloud Map or update prometheus.yml
with task IPs manually.

### Step 4 — Route table updates (one per region)

```hcl
# In us-east-1: route to Oregon monitoring VPC
resource "aws_route" "to_monitoring" {
  route_table_id            = var.requester_route_table_id
  destination_cidr_block    = var.accepter_cidr   # "10.1.0.0/16"
  vpc_peering_connection_id = aws_vpc_peering_connection.this.id
}

# In us-west-2: route back to Virginia app VPC
resource "aws_route" "to_app" {
  provider                  = aws.oregon
  route_table_id            = var.accepter_route_table_id
  destination_cidr_block    = var.requester_cidr  # "10.0.0.0/16"
  vpc_peering_connection_id = aws_vpc_peering_connection.this.id
}
```

## Provider configuration in root main.tf

This module needs two providers — pass both using the `providers` map:

```hcl
module "vpc_peering" {
  source = "./modules/vpc_peering"
  providers = {
    aws         = aws           # us-east-1 (default)
    aws.oregon  = aws.oregon    # us-west-2 (alias)
  }

  peering_name             = "pcx-lks-2026"
  requester_vpc_id         = module.vpc.vpc_id
  accepter_vpc_id          = module.monitoring_vpc.vpc_id
  requester_route_table_id = module.vpc.private_route_table_id
  accepter_route_table_id  = module.monitoring_vpc.private_route_table_id
  requester_cidr           = var.vpc_cidr
  accepter_cidr            = var.monitoring_vpc_cidr
  peer_region              = "us-west-2"
  peer_owner_id            = var.aws_account_id
}
```

Inside this module's `main.tf`, declare the required providers:

```hcl
terraform {
  required_providers {
    aws = {
      source                = "hashicorp/aws"
      version               = "~> 5.0"
      configuration_aliases = [aws.oregon]
    }
  }
}
```

## Required inputs

| Variable | Type | Description |
|---|---|---|
| `peering_name` | string | "pcx-lks-2026" |
| `requester_vpc_id` | string | lks-vpc ID (us-east-1) |
| `accepter_vpc_id` | string | lks-monitoring-vpc ID (us-west-2) |
| `requester_route_table_id` | string | lks-private-rt ID |
| `accepter_route_table_id` | string | lks-monitoring-rt ID |
| `requester_cidr` | string | "10.0.0.0/16" |
| `accepter_cidr` | string | "10.1.0.0/16" |
| `peer_region` | string | "us-west-2" |
| `peer_owner_id` | string | AWS account ID |

## Required outputs

| Output | Description |
|---|---|
| `peering_connection_id` | Connection ID for verification |
| `peering_connection_status` | Should be "active" after accept |

## Verification

```bash
# Check peering status in us-east-1
aws ec2 describe-vpc-peering-connections \
  --filters Name=tag:Name,Values=pcx-lks-2026 \
  --region us-east-1 \
  --query 'VpcPeeringConnections[0].Status.Code'
# Expected: "active"

# Verify route in us-east-1 private route table
aws ec2 describe-route-tables \
  --region us-east-1 \
  --filters Name=tag:Name,Values=lks-private-rt \
  --query 'RouteTables[0].Routes[?DestinationCidrBlock==`10.1.0.0/16`]'

# Verify route in us-west-2 monitoring route table
aws ec2 describe-route-tables \
  --region us-west-2 \
  --filters Name=tag:Name,Values=lks-monitoring-rt \
  --query 'RouteTables[0].Routes[?DestinationCidrBlock==`10.0.0.0/16`]'
```
