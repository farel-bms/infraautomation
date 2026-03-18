variable "peering_name"             { type = string }
variable "requester_vpc_id"         { type = string }
variable "accepter_vpc_id"          { type = string }
variable "requester_route_table_id" { type = string }
variable "accepter_route_table_id"  { type = string }
variable "requester_cidr"           { type = string }
variable "accepter_cidr"            { type = string }

# Inter-region: peer_region MUST be set — different from requester's region
variable "peer_region" {
  description = "AWS region of the accepter VPC (us-west-2 for Oregon monitoring VPC)"
  type        = string
  default     = "us-west-2"
}

# Inter-region: peer_owner_id is required for cross-region peering
# In Learner Lab this is always the same account — but must be explicit
variable "peer_owner_id" {
  description = "AWS account ID of the accepter VPC owner (same account for LKS 2026)"
  type        = string
}
