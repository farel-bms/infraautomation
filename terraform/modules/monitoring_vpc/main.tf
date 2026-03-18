# Write your Terraform resources here.
# All resources in this module use the aws.oregon provider alias (us-west-2).
# Declare it at the top of main.tf:
#
# terraform {
#   required_providers {
#     aws = {
#       source  = "hashicorp/aws"
#       version = "~> 5.0"
#     }
#   }
# }
#
# Resources required:
#   aws_vpc                    — lks-monitoring-vpc, CIDR 10.1.0.0/16
#   aws_subnet (×2)            — us-west-2a, us-west-2b (private only)
#   aws_route_table            — lks-monitoring-rt (no internet route)
#   aws_route_table_association (×2)
#   aws_vpc_endpoint           — ecr.api  (Interface, us-west-2)
#   aws_vpc_endpoint           — ecr.dkr  (Interface, us-west-2)
#   aws_vpc_endpoint           — logs     (Interface, us-west-2)
#   aws_vpc_endpoint           — s3       (Gateway,   us-west-2)
#
# Service name format: com.amazonaws.us-west-2.<service>
