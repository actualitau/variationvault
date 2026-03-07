output "distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.main.id
}

output "distribution_arn" {
  description = "CloudFront distribution ARN"
  value       = aws_cloudfront_distribution.main.arn
}

output "domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "hosted_zone_id" {
  description = "CloudFront distribution hosted zone ID"
  value       = aws_cloudfront_distribution.main.hosted_zone_id
}

output "status" {
  description = "Current status of the distribution"
  value       = aws_cloudfront_distribution.main.status
}

output "origin_access_control_id" {
  description = "Origin Access Control ID for S3"
  value       = aws_cloudfront_origin_access_control.s3.id
}