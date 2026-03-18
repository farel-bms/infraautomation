# Module: monitoring

Deploys the observability stack into lks-monitoring-vpc as ECS Fargate services.

## Resources to create

- `aws_ecs_cluster` — lks-monitoring-cluster
- `aws_cloudwatch_log_group` × 4 — one per service, retention 7 days
- `aws_sns_topic` — lks-alerts
- `aws_sns_topic_subscription` — email to sns_alert_email variable

### ECS Task Definitions + Services (Fargate)

| Service | Image | Port |
|---|---|---|
| lks-prometheus | prom/prometheus:latest | 9090 |
| lks-grafana | grafana/grafana:latest | 3000 |
| lks-loki | grafana/loki:latest | 3100 |
| lks-alertmanager | prom/alertmanager:latest | 9093 |

All tasks:
- network_mode:  awsvpc
- launch_type:   FARGATE
- subnets:       monitoring_subnet_ids
- security_group: lks-sg-monitoring
- assign_public_ip: false
- execution_role_arn: LabRole
- task_role_arn:      LabRole

### ECS Service Discovery (Cloud Map)
Fargate tasks get dynamic IPs, so register them with AWS Cloud Map so
Prometheus can discover targets by DNS name instead of hard-coded IPs.

- `aws_service_discovery_private_dns_namespace` — monitoring.local (in monitoring VPC)
- `aws_service_discovery_service` × 4 — one per monitoring service

## Required inputs

| Variable | Description |
|---|---|
| `cluster_name` | "lks-monitoring-cluster" |
| `aws_region` | For log config |
| `aws_account_id` | For ECR image reference |
| `monitoring_subnet_ids` | From monitoring_vpc module |
| `monitoring_sg_id` | lks-sg-monitoring |
| `image_tag` | Git SHA |
| `sns_alert_email` | Notification recipient |

## Required outputs

| Output |
|---|
| `cluster_arn` |
| `prometheus_service_name` |
| `grafana_service_name` |
| `sns_topic_arn` |
