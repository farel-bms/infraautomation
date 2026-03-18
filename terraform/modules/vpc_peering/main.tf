# Write your Terraform resources here.
# This module requires BOTH provider aliases. Declare them:
#
# terraform {
#   required_providers {
#     aws = {
#       source                = "hashicorp/aws"
#       version               = "~> 5.0"
#       configuration_aliases = [aws.oregon]
#     }
#   }
# }
#
# Resources required:
#
# 1. Peering connection — default (us-east-1) provider
#    aws_vpc_peering_connection "this"
#      vpc_id        = var.requester_vpc_id
#      peer_vpc_id   = var.accepter_vpc_id
#      peer_region   = var.peer_region          # "us-west-2" — REQUIRED for inter-region
#      peer_owner_id = var.peer_owner_id
#      # DO NOT set auto_accept — it does not work for inter-region
#
# 2. Accept the connection — aws.oregon provider
#    aws_vpc_peering_connection_accepter "this"
#      provider                  = aws.oregon
#      vpc_peering_connection_id = aws_vpc_peering_connection.this.id
#      auto_accept               = true
#
# 3. Route in us-east-1 private route table — default provider
#    aws_route "to_monitoring"
#      route_table_id            = var.requester_route_table_id
#      destination_cidr_block    = var.accepter_cidr   # "10.1.0.0/16"
#      vpc_peering_connection_id = aws_vpc_peering_connection.this.id
#
# 4. Route in us-west-2 monitoring route table — aws.oregon provider
#    aws_route "to_app"
#      provider                  = aws.oregon
#      route_table_id            = var.accepter_route_table_id
#      destination_cidr_block    = var.requester_cidr  # "10.0.0.0/16"
#      vpc_peering_connection_id = aws_vpc_peering_connection.this.id
#
# NOTE: Do NOT create aws_vpc_peering_connection_options — DNS resolution
#       is NOT supported for inter-region VPC Peering connections.
