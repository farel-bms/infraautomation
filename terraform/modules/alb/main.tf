# Write your Terraform resources here.
# Resources required:
#
#   aws_lb "this"
#     name               = var.alb_name           # "lks-alb"
#     internal           = false                   # internet-facing
#     load_balancer_type = "application"
#     security_groups    = [var.security_group_id]
#     subnets            = var.public_subnet_ids
#
#   aws_lb_target_group "fe"
#     name        = "lks-tg-fe"
#     port        = 3000
#     protocol    = "HTTP"
#     vpc_id      = var.vpc_id
#     target_type = "ip"    ← REQUIRED for Fargate awsvpc networking
#     health_check { path = "/health" }
#
#   aws_lb_target_group "api"
#     name        = "lks-tg-api"
#     port        = 8080
#     target_type = "ip"
#     health_check { path = "/api/health" }
#
#   aws_lb_target_group "analytics"
#     name        = "lks-tg-analytics"
#     port        = 5000
#     target_type = "ip"
#     health_check { path = "/api/stats/health" }
#
#   aws_lb_listener "http"
#     load_balancer_arn = aws_lb.this.arn
#     port              = 80
#     protocol          = "HTTP"
#     default_action { type = "forward", target_group_arn = aws_lb_target_group.fe.arn }
#
#   aws_lb_listener_rule "analytics"  (priority = 1)
#     condition { path_pattern { values = ["/api/stats/*"] } }
#     action { type = "forward", target_group_arn = aws_lb_target_group.analytics.arn }
#
#   aws_lb_listener_rule "api"  (priority = 2)
#     condition { path_pattern { values = ["/api/*"] } }
#     action { type = "forward", target_group_arn = aws_lb_target_group.api.arn }
