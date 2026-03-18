# Module: ecr

Creates ECR repositories for all Docker images.

## Resources to create

For each name in `repository_names`:
- `aws_ecr_repository`
  - image_tag_mutability = "MUTABLE"
  - scan_on_push         = true
  - encryption: AES256

- `aws_ecr_lifecycle_policy`
  - Keep the 5 most recent images
  - Delete untagged images older than 30 days

## Required inputs

| Variable | Type | Description |
|---|---|---|
| `repository_names` | list(string) | ["lks-fe-app", "lks-api-app", "lks-analytics-app", "lks-monitoring"] |

## Required outputs

| Output | Description |
|---|---|
| `repository_urls` | Map of name → full ECR URL |
