# VariationVault Deployment Guide

Complete guide for deploying VariationVault to AWS using Terraform and GitHub Actions.

## 🏗️ Architecture Overview

- **Frontend**: Next.js 14 with TypeScript and TailwindCSS  
- **Database**: PostgreSQL on AWS RDS
- **File Storage**: AWS S3 with CloudFront CDN
- **Compute**: AWS ECS Fargate containers
- **Deployment**: GitHub Actions CI/CD
- **Infrastructure**: Terraform for IaC

## 📋 Prerequisites

### 1. AWS Account Setup
- Create new AWS account for VariationVault
- Configure billing alerts
- Enable AWS Organizations (optional)

### 2. Domain Configuration (Optional)
- Purchase domain via Route 53
- Request SSL certificate in ACM (us-east-1 for CloudFront)

### 3. Development Tools
- Node.js 18+
- Docker
- Terraform 1.5+
- AWS CLI v2

## 🔐 AWS Credentials Setup

### Step 1: Create AWS Root Credentials

**⚠️ IMPORTANT: Store these credentials in Keeper vault immediately**

```bash
# After creating AWS account, create access keys:
# 1. Login to AWS Console as root user
# 2. Go to Security Credentials
# 3. Create New Access Key
# 4. Download CSV with credentials
```

### Step 2: Store in Keeper

Create new Keeper record with these details:

```
Title: VariationVault AWS Root Credentials
Type: Login
Login: [AWS Account Email]
Password: [AWS Account Password] 
URL: https://console.aws.amazon.com
Notes:
  Access Key ID: AKIA...
  Secret Access Key: [Secret Key]
  Account ID: [12-digit Account ID]
  Region: ap-southeast-2
```

### Step 3: Configure GitHub Secrets

Add these secrets to GitHub repository settings:

```
AWS_ACCESS_KEY_ID: [From Keeper]
AWS_SECRET_ACCESS_KEY: [From Keeper]
```

## 🏗️ Infrastructure Deployment

### Step 1: Initialize Terraform

```bash
cd infrastructure/
terraform init
```

### Step 2: Plan Infrastructure

```bash
terraform plan -var="project_name=variationvault" -var="environment=prod"
```

### Step 3: Deploy Infrastructure

```bash
terraform apply -var="project_name=variationvault" -var="environment=prod"
```

### Step 4: Configure State Backend (After First Apply)

Uncomment the backend configuration in `main.tf`:

```hcl
backend "s3" {
  bucket         = "variationvault-terraform-state"
  key            = "production/terraform.tfstate"
  region         = "ap-southeast-2"
  encrypt        = true
  dynamodb_table = "terraform-state-lock"
}
```

## 🚀 Application Deployment

### Step 1: Build and Push Initial Image

```bash
# Build locally first
docker build -t variationvault .

# Tag for ECR
aws ecr get-login-password --region ap-southeast-2 | docker login --username AWS --password-stdin [ACCOUNT].dkr.ecr.ap-southeast-2.amazonaws.com

docker tag variationvault:latest [ACCOUNT].dkr.ecr.ap-southeast-2.amazonaws.com/variationvault:latest
docker push [ACCOUNT].dkr.ecr.ap-southeast-2.amazonaws.com/variationvault:latest
```

### Step 2: Run Database Migrations

```bash
# After ECS service is running
aws ecs run-task \
  --cluster variationvault-prod-cluster \
  --task-definition variationvault-prod \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=DISABLED}" \
  --overrides '{"containerOverrides":[{"name":"variationvault-app","command":["npm","run","db:migrate"]}]}'
```

### Step 3: Verify Deployment

```bash
# Check service status
aws ecs describe-services --cluster variationvault-prod-cluster --services variationvault-prod-service

# Get application URL
terraform output application_url
```

## 🔧 Configuration

### Environment Variables

Required environment variables (stored in AWS Secrets Manager):

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# AWS Configuration
AWS_REGION=ap-southeast-2
AWS_S3_BUCKET=variationvault-uploads-bucket

# Authentication
NEXTAUTH_SECRET=generated-secret
NEXTAUTH_URL=https://your-domain.com

# Email Configuration
EMAIL_FROM=noreply@variationvault.com
SMTP_HOST=email-smtp.ap-southeast-2.amazonaws.com
SMTP_PORT=587
SMTP_USER=smtp-user
SMTP_PASS=smtp-password
```

### Performance Tuning

#### ECS Configuration
```hcl
# For production load
ecs_desired_count = 3
ecs_cpu = 1024
ecs_memory = 2048
enable_autoscaling = true
```

#### Database Configuration
```hcl
# For production load
database_instance_class = "db.t3.small"
database_allocated_storage = 100
```

## 📊 Monitoring Setup

### CloudWatch Dashboards

Create dashboard for:
- ECS task health and performance
- RDS connection count and CPU
- CloudFront cache hit ratio
- Application response times

### Alarms

Configure alarms for:
- ECS service unhealthy tasks
- RDS CPU > 80%
- CloudFront 4xx/5xx errors
- Application response time > 2s

### Log Management

```bash
# View application logs
aws logs tail /aws/ecs/variationvault-prod --follow

# View database logs
aws rds describe-db-log-files --db-instance-identifier variationvault-prod-db
```

## 🔒 Security Hardening

### Network Security
- VPC with private subnets for application and database
- Security groups with minimal required access
- NAT gateways for outbound internet access

### Data Security
- RDS encryption at rest
- S3 bucket encryption
- Secrets stored in AWS Secrets Manager
- SSL/TLS everywhere

### Application Security
- Security headers configured
- Input validation and sanitization
- Rate limiting (CloudFront + WAF)
- Regular dependency updates

## 📈 Cost Optimization

### Initial Setup (Low Traffic)
```hcl
# Estimated cost: ~$50-100/month
database_instance_class = "db.t3.micro"    # $12/month
ecs_desired_count = 1                      # $15/month
enable_spot_instances = true               # 70% savings
```

### Production Setup (High Traffic)
```hcl
# Estimated cost: ~$200-300/month
database_instance_class = "db.t3.small"   # $25/month
ecs_desired_count = 3                      # $45/month
enable_autoscaling = true                  # Dynamic scaling
```

### Cost Monitoring
- Set up billing alerts at $50, $100, $200
- Review AWS Cost Explorer monthly
- Use Trusted Advisor recommendations

## 🚨 Disaster Recovery

### Backup Strategy
- RDS automated backups (7 days retention)
- S3 versioning enabled
- Terraform state in S3 with versioning

### Recovery Procedures
```bash
# Restore database from backup
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier variationvault-restore \
  --db-snapshot-identifier variationvault-backup-2024-03-07

# Rollback application deployment
git revert [commit-hash]
git push origin main  # Triggers auto-deployment
```

## 🔄 Maintenance

### Regular Tasks
- [ ] Monthly: Review and rotate secrets
- [ ] Monthly: Update dependencies (`npm audit`)
- [ ] Monthly: Review AWS costs and usage
- [ ] Quarterly: Update Terraform modules
- [ ] Quarterly: Security audit and pen testing

### Updates
```bash
# Update application
git push origin main  # Auto-deploys via GitHub Actions

# Update infrastructure
cd infrastructure/
terraform plan
terraform apply
```

## 🆘 Troubleshooting

### Common Issues

#### Deployment Fails
```bash
# Check ECS service events
aws ecs describe-services --cluster variationvault-prod-cluster --services variationvault-prod-service

# Check CloudWatch logs
aws logs tail /aws/ecs/variationvault-prod --follow
```

#### Database Connection Issues
```bash
# Test database connectivity
aws rds describe-db-instances --db-instance-identifier variationvault-prod-db

# Check security groups
aws ec2 describe-security-groups --group-ids sg-xxx
```

#### High Costs
```bash
# Review costs by service
aws ce get-cost-and-usage --time-period Start=2024-03-01,End=2024-03-31 --granularity DAILY --metrics BlendedCost
```

## 📞 Support

For issues with:
- **Infrastructure**: Check Terraform documentation
- **Application**: Review Next.js and AWS docs
- **Database**: Check RDS CloudWatch metrics
- **Deployment**: Review GitHub Actions logs

---

**VariationVault Deployment Guide v1.0**  
Last Updated: March 2026