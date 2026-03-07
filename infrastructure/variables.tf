# Variables for VariationVault AWS Infrastructure

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "variationvault"
}

variable "environment" {
  description = "Environment name (e.g., prod, staging, dev)"
  type        = string
  default     = "prod"
}

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "ap-southeast-2"  # Sydney - closest to Brisbane
}

# Networking
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# Database
variable "database_name" {
  description = "Name of the PostgreSQL database"
  type        = string
  default     = "variationvault"
}

variable "database_user" {
  description = "Database master username"
  type        = string
  default     = "variationvault_admin"
}

variable "database_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"  # Free tier eligible for testing
}

variable "database_allocated_storage" {
  description = "Allocated storage for RDS instance (GB)"
  type        = number
  default     = 20
}

# Application
variable "app_docker_image" {
  description = "Docker image for the application"
  type        = string
  default     = "actualitau/variationvault:latest"
}

variable "app_port" {
  description = "Port the application listens on"
  type        = number
  default     = 3000
}

# ECS Configuration
variable "ecs_desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 2
}

variable "ecs_cpu" {
  description = "CPU units for ECS task (256, 512, 1024, 2048, 4096)"
  type        = number
  default     = 512
}

variable "ecs_memory" {
  description = "Memory for ECS task (MB)"
  type        = number
  default     = 1024
}

# Domain and SSL
variable "domain_name" {
  description = "Domain name for the application (optional)"
  type        = string
  default     = ""  # Will use CloudFront domain if not provided
}

variable "ssl_certificate_arn" {
  description = "ACM certificate ARN for HTTPS (required if domain_name is provided)"
  type        = string
  default     = ""
}

# Email Configuration
variable "email_from" {
  description = "From email address for notifications"
  type        = string
  default     = "noreply@variationvault.com"
}

variable "smtp_host" {
  description = "SMTP host for sending emails"
  type        = string
  default     = ""
}

variable "smtp_port" {
  description = "SMTP port"
  type        = string
  default     = "587"
}

variable "smtp_user" {
  description = "SMTP username"
  type        = string
  default     = ""
  sensitive   = true
}

variable "smtp_pass" {
  description = "SMTP password"
  type        = string
  default     = ""
  sensitive   = true
}

# Monitoring
variable "log_retention_days" {
  description = "CloudWatch log retention period"
  type        = number
  default     = 14
}

# Scaling
variable "enable_autoscaling" {
  description = "Enable ECS auto-scaling"
  type        = bool
  default     = true
}

variable "autoscaling_min_capacity" {
  description = "Minimum number of ECS tasks"
  type        = number
  default     = 1
}

variable "autoscaling_max_capacity" {
  description = "Maximum number of ECS tasks"
  type        = number
  default     = 10
}

variable "autoscaling_target_cpu" {
  description = "Target CPU utilization for auto-scaling"
  type        = number
  default     = 70
}

variable "autoscaling_target_memory" {
  description = "Target memory utilization for auto-scaling"
  type        = number
  default     = 80
}

# Backup and Maintenance
variable "database_backup_retention_period" {
  description = "Number of days to retain database backups"
  type        = number
  default     = 7
}

variable "database_maintenance_window" {
  description = "Maintenance window for RDS"
  type        = string
  default     = "sun:18:00-sun:19:00"  # 4-5am AEST Sunday
}

variable "database_backup_window" {
  description = "Backup window for RDS"
  type        = string
  default     = "17:00-18:00"  # 3-4am AEST
}

# Security
variable "allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access the application"
  type        = list(string)
  default     = ["0.0.0.0/0"]  # Allow all - restrict in production
}

variable "enable_deletion_protection" {
  description = "Enable deletion protection for RDS"
  type        = bool
  default     = true
}

variable "enable_encryption" {
  description = "Enable encryption at rest"
  type        = bool
  default     = true
}

# Cost Optimization
variable "enable_spot_instances" {
  description = "Use Spot instances for ECS tasks (cost savings)"
  type        = bool
  default     = false  # Set to true for non-production
}

# Tags
variable "additional_tags" {
  description = "Additional tags to apply to resources"
  type        = map(string)
  default = {
    Owner = "ActualIT"
    Billing = "VariationVault"
    Backup = "Required"
  }
}