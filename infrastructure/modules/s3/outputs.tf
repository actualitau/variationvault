output "uploads_bucket_name" {
  description = "Name of the uploads S3 bucket"
  value       = aws_s3_bucket.uploads.bucket
}

output "uploads_bucket_arn" {
  description = "ARN of the uploads S3 bucket"
  value       = aws_s3_bucket.uploads.arn
}

output "uploads_bucket_domain_name" {
  description = "Domain name of the uploads S3 bucket"
  value       = aws_s3_bucket.uploads.bucket_domain_name
}

output "logs_bucket_name" {
  description = "Name of the logs S3 bucket"
  value       = aws_s3_bucket.logs.bucket
}

output "logs_bucket_arn" {
  description = "ARN of the logs S3 bucket"
  value       = aws_s3_bucket.logs.arn
}

output "s3_access_role_arn" {
  description = "ARN of the IAM role for S3 access"
  value       = aws_iam_role.s3_access.arn
}

output "cloudfront_origin_access_control_id" {
  description = "CloudFront Origin Access Control ID"
  value       = aws_cloudfront_origin_access_control.uploads.id
}