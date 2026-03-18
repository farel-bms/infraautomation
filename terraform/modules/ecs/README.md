# Module: ecs

Creates the application ECS Cluster (lks-ecs-cluster) with three services.

## Resources to create

- `aws_ecs_cluster` — lks-ecs-cluster, Container Insights enabled
- `aws_cloudwatch_log_group` × 3 — /ecs/lks-fe-app, /ecs/lks-api-app, /ecs/lks-analytics-app
  - retention: 7 days

### For each service (fe, api, analytics):

- `aws_ecs_task_definition`
  - launch_type:  FARGATE
  - network_mode: awsvpc
  - cpu / memory: see table in module Section 8
  - container_definitions: JSON with image, port, logConfiguration (awslogs)
  - execution_role_arn: LabRole (already exists in Learner Lab)
  - task_role_arn:      LabRole

- `aws_ecs_service`
  - launch_type:   FARGATE
  - desired_count: from variable
  - network_configuration: private subnets, lks-sg-ecs, assign_public_ip=false
  - load_balancer: link to correct target group ARN
  - deployment_minimum_healthy_percent: 50
  - deployment_maximum_percent:         200

- `aws_appautoscaling_target` + `aws_appautoscaling_policy`
  - min_capacity: 1, max_capacity: 3
  - Scale up when CPU > 70%

## Required inputs

| Variable | Description |
|---|---|
| `cluster_name` | "lks-ecs-cluster" |
| `aws_region` | For log group config |
| `aws_account_id` | For ECR image URLs |
| `private_subnet_ids` | From vpc module |
| `security_group_id` | lks-sg-ecs ID |
| `fe_target_group_arn` | From alb module |
| `api_target_group_arn` | From alb module |
| `analytics_target_group_arn` | From alb module |
| `image_tag` | Git SHA from CI/CD |
| `fe_desired_count` | Default 2 |
| `api_desired_count` | Default 2 |
| `analytics_desired_count` | Default 1 |

## Required outputs

| Output |
|---|
| `cluster_arn` |
| `fe_service_name` |
| `api_service_name` |
| `analytics_service_name` |

## Note on IAM in Learner Lab

In AWS Academy Learner Lab, use the pre-existing role `LabRole` for both
`execution_role_arn` and `task_role_arn`. You cannot create new IAM roles.
The ARN format is:
`arn:aws:iam::<ACCOUNT_ID>:role/LabRole`
