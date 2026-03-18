variable "cluster_name"               { type = string }
variable "aws_region"                 { type = string }
variable "aws_account_id"             { type = string }
variable "private_subnet_ids"         { type = list(string) }
variable "security_group_id"          { type = string }
variable "fe_target_group_arn"        { type = string }
variable "api_target_group_arn"       { type = string }
variable "analytics_target_group_arn" { type = string }
variable "image_tag"                  { type = string; default = "latest" }
variable "fe_desired_count"           { type = number; default = 2 }
variable "api_desired_count"          { type = number; default = 2 }
variable "analytics_desired_count"    { type = number; default = 1 }
