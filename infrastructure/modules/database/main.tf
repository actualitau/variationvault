# Database Module for VariationVault
# Creates RDS PostgreSQL instance with security groups

# Security Group for RDS
resource "aws_security_group" "database" {
  name        = "${var.project_name}-${var.environment}-database-sg"
  description = "Security group for VariationVault database"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.database_access.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-database-sg"
  }
}

# Security Group for database access (to be attached to ECS tasks)
resource "aws_security_group" "database_access" {
  name        = "${var.project_name}-${var.environment}-database-access-sg"
  description = "Security group for resources that need database access"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-database-access-sg"
  }
}

# KMS Key for RDS encryption
resource "aws_kms_key" "database" {
  description             = "KMS key for VariationVault database encryption"
  deletion_window_in_days = 7

  tags = {
    Name = "${var.project_name}-${var.environment}-database-kms-key"
  }
}

resource "aws_kms_alias" "database" {
  name          = "alias/${var.project_name}-${var.environment}-database"
  target_key_id = aws_kms_key.database.key_id
}

# Parameter Group for PostgreSQL optimization
resource "aws_db_parameter_group" "postgresql" {
  family = "postgres15"
  name   = "${var.project_name}-${var.environment}-postgres-params"

  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements"
  }

  parameter {
    name  = "log_statement"
    value = "all"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000"  # Log queries taking more than 1 second
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-postgres-params"
  }
}

# RDS PostgreSQL Instance
resource "aws_db_instance" "postgresql" {
  identifier = "${var.project_name}-${var.environment}-db"

  # Database Configuration
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = var.instance_class
  allocated_storage    = var.allocated_storage
  max_allocated_storage = var.allocated_storage * 2
  storage_type         = "gp3"
  storage_encrypted    = true
  kms_key_id          = aws_kms_key.database.arn

  # Database Details
  db_name  = var.database_name
  username = var.database_user
  password = var.database_password
  port     = 5432

  # Network Configuration
  vpc_security_group_ids = [aws_security_group.database.id]
  db_subnet_group_name   = var.subnet_group_name
  publicly_accessible    = false

  # Parameter and Option Groups
  parameter_group_name = aws_db_parameter_group.postgresql.name

  # Backup Configuration
  backup_retention_period = var.backup_retention_period
  backup_window          = var.backup_window
  maintenance_window     = var.maintenance_window
  copy_tags_to_snapshot  = true

  # Monitoring
  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.rds_monitoring.arn
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  # Performance Insights
  performance_insights_enabled          = true
  performance_insights_retention_period = 7

  # Protection
  deletion_protection = var.enable_deletion_protection
  skip_final_snapshot = false
  final_snapshot_identifier = "${var.project_name}-${var.environment}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"

  # Auto Minor Version Update
  auto_minor_version_upgrade = true

  tags = {
    Name = "${var.project_name}-${var.environment}-database"
  }

  lifecycle {
    ignore_changes = [
      password,
      final_snapshot_identifier,
    ]
  }
}

# IAM Role for RDS Enhanced Monitoring
resource "aws_iam_role" "rds_monitoring" {
  name = "${var.project_name}-${var.environment}-rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-rds-monitoring-role"
  }
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# CloudWatch Alarms for monitoring
resource "aws_cloudwatch_metric_alarm" "database_cpu" {
  alarm_name          = "${var.project_name}-${var.environment}-database-cpu-utilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors RDS CPU utilization"
  alarm_actions       = [aws_sns_topic.database_alerts.arn]

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.postgresql.id
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-database-cpu-alarm"
  }
}

resource "aws_cloudwatch_metric_alarm" "database_connections" {
  alarm_name          = "${var.project_name}-${var.environment}-database-connections"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors RDS connection count"
  alarm_actions       = [aws_sns_topic.database_alerts.arn]

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.postgresql.id
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-database-connections-alarm"
  }
}

# SNS Topic for Database Alerts
resource "aws_sns_topic" "database_alerts" {
  name = "${var.project_name}-${var.environment}-database-alerts"

  tags = {
    Name = "${var.project_name}-${var.environment}-database-alerts"
  }
}