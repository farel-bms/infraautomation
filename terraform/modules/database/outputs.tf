output "rds_endpoint"         { value = "" /* TODO: aws_db_instance.this.endpoint */ ; sensitive = true }
output "sqs_queue_url"        { value = "" /* TODO: aws_sqs_queue.this.url */ }
output "dlq_url"              { value = "" /* TODO: aws_sqs_queue.dlq.url */ }
output "dynamodb_table_name"  { value = "" /* TODO: aws_dynamodb_table.this.name */ }
output "tfstate_bucket_name"  { value = "" /* TODO: aws_s3_bucket.tfstate.bucket */ }
output "assets_bucket_name"   { value = "" /* TODO: aws_s3_bucket.assets.bucket */ }
