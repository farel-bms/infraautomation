variable "cluster_name"          { type = string }
variable "aws_region"            { type = string }
variable "aws_account_id"        { type = string }
variable "monitoring_subnet_ids" { type = list(string) }
variable "monitoring_sg_id"      { type = string }
variable "image_tag"             { type = string; default = "latest" }
variable "sns_alert_email"       { type = string }
