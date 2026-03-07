# CloudFront Module for VariationVault
# Creates CloudFront distribution for global content delivery

# CloudFront Distribution
resource "aws_cloudfront_distribution" "main" {
  origin {
    domain_name = var.alb_domain_name
    origin_id   = "${var.project_name}-${var.environment}-alb-origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # S3 Origin for static assets
  origin {
    domain_name              = var.s3_bucket_domain_name
    origin_id                = "${var.project_name}-${var.environment}-s3-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.s3.id
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "VariationVault ${var.environment} distribution"
  default_root_object = "index.html"

  # Aliases (custom domains)
  aliases = var.domain_name != "" ? [var.domain_name] : []

  # Default cache behavior (for the web app)
  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "${var.project_name}-${var.environment}-alb-origin"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = true
      headers      = ["Host", "Authorization", "CloudFront-Forwarded-Proto"]
      cookies {
        forward = "all"
      }
    }

    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }

  # Cache behavior for static assets
  ordered_cache_behavior {
    path_pattern           = "/uploads/*"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "${var.project_name}-${var.environment}-s3-origin"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 86400
    max_ttl     = 31536000
  }

  # Cache behavior for API routes
  ordered_cache_behavior {
    path_pattern           = "/api/*"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "${var.project_name}-${var.environment}-alb-origin"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = true
      headers      = ["*"]
      cookies {
        forward = "all"
      }
    }

    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
  }

  price_class = "PriceClass_100"  # US, Canada, Europe (cost optimization)

  restrictions {
    geo_restriction {
      restriction_type = "whitelist"
      locations        = ["AU", "NZ", "US"]  # Australia, New Zealand, US for testing
    }
  }

  # SSL Certificate
  viewer_certificate {
    cloudfront_default_certificate = var.certificate_arn == ""
    acm_certificate_arn            = var.certificate_arn != "" ? var.certificate_arn : null
    ssl_support_method             = var.certificate_arn != "" ? "sni-only" : null
    minimum_protocol_version       = var.certificate_arn != "" ? "TLSv1.2_2021" : null
  }

  # Custom error pages
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
    error_caching_min_ttl = 300
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
    error_caching_min_ttl = 300
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-cloudfront"
  }

  # Wait for the distribution to be deployed
  wait_for_deployment = false
}

# Origin Access Control for S3
resource "aws_cloudfront_origin_access_control" "s3" {
  name                              = "${var.project_name}-${var.environment}-s3-oac"
  description                       = "Origin Access Control for S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudWatch Alarms for monitoring
resource "aws_cloudwatch_metric_alarm" "cloudfront_4xx_error_rate" {
  alarm_name          = "${var.project_name}-${var.environment}-cloudfront-4xx-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "4xxErrorRate"
  namespace           = "AWS/CloudFront"
  period              = "300"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "This metric monitors CloudFront 4xx error rate"
  
  dimensions = {
    DistributionId = aws_cloudfront_distribution.main.id
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-cloudfront-4xx-alarm"
  }
}

resource "aws_cloudwatch_metric_alarm" "cloudfront_5xx_error_rate" {
  alarm_name          = "${var.project_name}-${var.environment}-cloudfront-5xx-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "5xxErrorRate"
  namespace           = "AWS/CloudFront"
  period              = "300"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "This metric monitors CloudFront 5xx error rate"
  
  dimensions = {
    DistributionId = aws_cloudfront_distribution.main.id
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-cloudfront-5xx-alarm"
  }
}