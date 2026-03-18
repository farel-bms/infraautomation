output "peering_connection_id" {
  description = "VPC Peering Connection ID — verify status is 'active' after apply"
  value       = "" /* TODO: aws_vpc_peering_connection.this.id */
}

output "peering_connection_status" {
  description = "Should be 'active' after the accepter resource runs"
  value       = "" /* TODO: aws_vpc_peering_connection_accepter.this.accept_status */
}
