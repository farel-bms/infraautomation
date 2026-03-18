output "vpc_id"                 { value = "" /* TODO */ }
output "subnet_ids"             { value = [] /* TODO */ }
output "private_route_table_id" { value = "" /* TODO */ }

# Inter-region: export region so vpc_peering module knows which provider to use
output "region" {
  value = var.aws_region
}
