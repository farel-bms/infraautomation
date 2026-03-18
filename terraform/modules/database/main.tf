# Write your Terraform resources here.
# Resources required:
#
# ── RDS PostgreSQL ──────────────────────────────────────────────
#   aws_db_subnet_group "this"
#     subnet_ids = var.isolated_subnet_ids
#
#   aws_db_instance "this"
#     identifier             = "lks-rds-postgres"
#     engine                 = "postgres"
#     engine_version         = "15"
#     instance_class         = var.db_instance_class
#     allocated_storage      = 20
#     db_name                = var.db_name
#     username               = var.db_username
#     password               = var.db_password
#     db_subnet_group_name   = aws_db_subnet_group.this.name
#     vpc_security_group_ids = [var.security_group_id]
#     publicly_accessible    = false
#     skip_final_snapshot    = true
#     backup_retention_period = 7
#
# ── DynamoDB ────────────────────────────────────────────────────
#   aws_dynamodb_table "sessions"
#     name           = var.dynamo_table    # "lks-sessions"
#     billing_mode   = "PAY_PER_REQUEST"
#     hash_key       = "sessionId"
#     range_key      = "createdAt"
#     attribute { name = "sessionId", type = "S" }
#     attribute { name = "createdAt", type = "N" }
#     ttl { attribute_name = "expiresAt", enabled = true }
#     point_in_time_recovery { enabled = true }
#
# ── SQS ─────────────────────────────────────────────────────────
#   aws_sqs_queue "dlq"
#     name = var.dlq_name    # "lks-dlq"
#
#   aws_sqs_queue "main"
#     name                       = var.sqs_queue_name    # "lks-event-queue"
#     visibility_timeout_seconds = 30
#     message_retention_seconds  = 345600
#     redrive_policy = jsonencode({
#       deadLetterTargetArn = aws_sqs_queue.dlq.arn
#       maxReceiveCount     = 3
#     })
#
# ── SSM Parameters ───────────────────────────────────────────────
#   aws_ssm_parameter "db_host"
#     name  = "/lks/app/db_host"
#     type  = "SecureString"
#     value = aws_db_instance.this.endpoint
#
#   aws_ssm_parameter "db_password"  (SecureString)
#   aws_ssm_parameter "sqs_url"      (String)
#   aws_ssm_parameter "dynamo_table" (String)
