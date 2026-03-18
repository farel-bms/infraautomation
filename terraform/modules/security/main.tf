# Write your Terraform resources here.
# Resources required:
#
#   aws_security_group "alb"
#     name   = "lks-sg-alb"
#     vpc_id = var.vpc_id
#     ingress: port 80  from 0.0.0.0/0
#     ingress: port 443 from 0.0.0.0/0
#     egress:  all traffic
#
#   aws_security_group "ecs"
#     name   = "lks-sg-ecs"
#     vpc_id = var.vpc_id
#     ingress: port 3000 from aws_security_group.alb.id
#     ingress: port 8080 from aws_security_group.alb.id
#     ingress: port 5000 from aws_security_group.alb.id
#     ingress: port 9100 from var.monitoring_vpc_cidr   ← Prometheus via inter-region peering
#     egress:  all traffic
#
#   aws_security_group "db"
#     name   = "lks-sg-db"
#     vpc_id = var.vpc_id
#     ingress: port 5432 from aws_security_group.ecs.id
#     ingress: port 443  from aws_security_group.ecs.id
#     egress:  none
#
#   aws_security_group "monitoring"
#     name   = "lks-sg-monitoring"
#     vpc_id = var.vpc_id  (NOTE: this will be the monitoring VPC ID — pass it correctly)
#     ingress: port 9090 from self
#     ingress: port 3000 from var.app_vpc_cidr    ← Grafana accessible from app VPC
#     ingress: port 3100 from self
#     ingress: port 9093 from self
#     egress:  all traffic
