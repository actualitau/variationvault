# VariationVault AWS Infrastructure
# Terraform configuration for production deployment

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }

  # Store Terraform state in S3 (uncomment after S3 bucket is created)
  # backend "s3" {
  #   bucket         = "variationvault-terraform-state"
  #   key            = "production/terraform.tfstate"
  #   region         = "ap-southeast-2"
  #   encrypt        = true
  #   dynamodb_table = "terraform-state-lock"
  # }
}

# Configure AWS Provider
provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "VariationVault"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "ActualIT"
    }
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# Random password for RDS
resource "random_password" "database_password" {
  length  = 32
  special = true
}

# VPC and Networking
module "vpc" {
  source = "./modules/vpc"
  
  project_name        = var.project_name
  environment         = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = data.aws_availability_zones.available.names
}

# RDS PostgreSQL Database
module "database" {
  source = "./modules/database"
  
  project_name        = var.project_name
  environment         = var.environment
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.database_subnet_ids
  subnet_group_name  = module.vpc.database_subnet_group_name
  database_name      = var.database_name
  database_user      = var.database_user
  database_password  = random_password.database_password.result
  instance_class     = var.database_instance_class
  allocated_storage  = var.database_allocated_storage
}

# S3 Buckets
module "s3" {
  source = "./modules/s3"
  
  project_name = var.project_name
  environment  = var.environment
}

# ECS Fargate for Next.js Application
module "ecs" {
  source = "./modules/ecs"
  
  project_name           = var.project_name
  environment           = var.environment
  vpc_id                = module.vpc.vpc_id
  subnet_ids            = module.vpc.private_subnet_ids
  public_subnet_ids     = module.vpc.public_subnet_ids
  database_url          = module.database.database_url
  s3_bucket_name        = module.s3.uploads_bucket_name
  s3_bucket_region      = var.aws_region
  app_image             = var.app_docker_image
  app_port              = var.app_port
  desired_count         = var.ecs_desired_count
  cpu                   = var.ecs_cpu
  memory                = var.ecs_memory
}

# CloudFront Distribution
module "cloudfront" {
  source = "./modules/cloudfront"
  
  project_name           = var.project_name
  environment           = var.environment
  alb_domain_name       = module.ecs.load_balancer_dns_name
  s3_bucket_domain_name = module.s3.uploads_bucket_domain_name
  domain_name           = var.domain_name
  certificate_arn       = var.ssl_certificate_arn
}

# Route 53 DNS (if domain is provided)
module "route53" {
  count  = var.domain_name != "" ? 1 : 0
  source = "./modules/route53"
  
  project_name           = var.project_name
  domain_name           = var.domain_name
  cloudfront_domain_name = module.cloudfront.domain_name
  cloudfront_zone_id    = module.cloudfront.hosted_zone_id
}

# Secrets Manager for Environment Variables
resource "aws_secretsmanager_secret" "app_secrets" {
  name = "${var.project_name}-${var.environment}-secrets"
  description = "Environment variables for VariationVault application"
  
  tags = {
    Name = "${var.project_name}-secrets"
  }
}

resource "aws_secretsmanager_secret_version" "app_secrets" {
  secret_id = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode({
    DATABASE_URL = module.database.database_url
    AWS_S3_BUCKET = module.s3.uploads_bucket_name
    AWS_REGION = var.aws_region
    NEXTAUTH_SECRET = random_password.nextauth_secret.result
    NEXTAUTH_URL = var.domain_name != "" ? "https://${var.domain_name}" : "https://${module.cloudfront.domain_name}"
    EMAIL_FROM = var.email_from
    SMTP_HOST = var.smtp_host
    SMTP_PORT = var.smtp_port
    SMTP_USER = var.smtp_user
    SMTP_PASS = var.smtp_pass
  })
}

# Additional secrets
resource "random_password" "nextauth_secret" {
  length  = 32
  special = true
}

# IAM role for GitHub Actions
resource "aws_iam_user" "github_actions" {
  name = "${var.project_name}-github-actions"
  path = "/"
  
  tags = {
    Name = "${var.project_name}-github-actions"
  }
}

resource "aws_iam_access_key" "github_actions" {
  user = aws_iam_user.github_actions.name
}

resource "aws_iam_user_policy" "github_actions_policy" {
  name = "${var.project_name}-github-actions-policy"
  user = aws_iam_user.github_actions.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecs:UpdateService",
          "ecs:DescribeServices",
          "ecs:RegisterTaskDefinition",
          "ecs:DescribeTaskDefinition",
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:PutImage",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "iam:PassRole"
        ]
        Resource = "*"
      }
    ]
  })
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "app_logs" {
  name              = "/aws/ecs/${var.project_name}-${var.environment}"
  retention_in_days = var.log_retention_days
  
  tags = {
    Name = "${var.project_name}-logs"
  }
}

# Output values
output "application_url" {
  description = "URL to access the VariationVault application"
  value       = var.domain_name != "" ? "https://${var.domain_name}" : "https://${module.cloudfront.domain_name}"
}

output "database_endpoint" {
  description = "RDS database endpoint"
  value       = module.database.database_endpoint
  sensitive   = true
}

output "s3_bucket_name" {
  description = "S3 bucket for file uploads"
  value       = module.s3.uploads_bucket_name
}

output "github_actions_access_key" {
  description = "Access key for GitHub Actions deployment"
  value       = aws_iam_access_key.github_actions.id
  sensitive   = true
}

output "github_actions_secret_key" {
  description = "Secret key for GitHub Actions deployment"
  value       = aws_iam_access_key.github_actions.secret
  sensitive   = true
}