output "database_endpoint" {
  description = "Database endpoint"
  value       = aws_db_instance.postgresql.endpoint
}

output "database_port" {
  description = "Database port"
  value       = aws_db_instance.postgresql.port
}

output "database_name" {
  description = "Database name"
  value       = aws_db_instance.postgresql.db_name
}

output "database_username" {
  description = "Database username"
  value       = aws_db_instance.postgresql.username
  sensitive   = true
}

output "database_url" {
  description = "Complete database URL for application"
  value       = "postgresql://${aws_db_instance.postgresql.username}:${var.database_password}@${aws_db_instance.postgresql.endpoint}/${aws_db_instance.postgresql.db_name}"
  sensitive   = true
}

output "database_security_group_id" {
  description = "Security group ID for database access"
  value       = aws_security_group.database_access.id
}

output "database_instance_id" {
  description = "Database instance identifier"
  value       = aws_db_instance.postgresql.id
}