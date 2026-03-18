# Write your Terraform resources here.
# See README.md for the full list of resources to create.
#
# Resources required:
#   aws_vpc                         — lks-vpc
#   aws_subnet (×6)                 — public ×2, private ×2, isolated ×2
#   aws_internet_gateway            — lks-igw
#   aws_eip                         — for NAT Gateway
#   aws_nat_gateway                 — lks-nat-gw (public subnet us-east-1a)
#   aws_route_table (×3)            — lks-public-rt, lks-private-rt, lks-isolated-rt
#   aws_route (×2)                  — 0.0.0.0/0→IGW (public), 0.0.0.0/0→NAT (private)
#   aws_route_table_association (×6)
#
# Naming: use var.vpc_name as the Name tag prefix for all resources.
# Tags:   include Name, Project = "lks2026", ManagedBy = "Terraform" on every resource.
