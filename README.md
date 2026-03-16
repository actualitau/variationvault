# VariationVault

**Mobile-first SaaS for Australian tradies** - Quick variation approvals, site documentation, and evidence tracking.

## 🎯 Performance Targets

- **<60s** variation creation
- **<30s** client approval  
- **<15s** evidence export
- **Mobile-first** PWA experience

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 + TypeScript + TailwindCSS
- **Database**: Prisma + PostgreSQL
- **Deployment**: AWS (Terraform ready)
- **PWA**: Progressive Web App with offline support
- **Mobile**: Camera integration, touch-optimized UI

## 🚀 Core Features

### 1. Variation Creation System
- Mobile-optimized form with photo capture
- Quick template selection for common variation types
- Auto-populate from existing site documentation
- Real-time cost estimation with GST calculation
- Client-friendly description builder

### 2. Client Approval Workflow
- SMS/email notification system
- Mobile approval interface (no login required)
- Visual before/after photo comparison
- Digital signature capture
- Real-time approval status tracking

### 3. Evidence Export System
- PDF generation with photos and signatures
- Email delivery to all stakeholders
- Multiple export formats (PDF, CSV, JSON)
- Accounting system integration ready
- Complete audit trail maintenance

## 📱 Mobile-First Design

- **One-handed operation** - thumb-friendly interface
- **Touch targets** - minimum 44px for accessibility
- **Camera integration** - direct photo capture
- **Offline support** - PWA with sync capabilities
- **Australian compliance** - GST calculation, privacy laws

## 🗃️ Database Schema

```prisma
model Variation {
  id           String   @id @default(cuid())
  jobId        String
  clientEmail  String
  description  String
  reason       String
  scopeChange  String
  materialCost Float
  laborCost    Float
  gst          Float
  totalCost    Float
  status       String   @default("pending")
  photos       String[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  // Approval tracking
  approvedAt   DateTime?
  rejectedAt   DateTime?
  approvedBy   String?
  rejectedBy   String?
  signature    String?
  notes        String?
}
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- AWS account (for production)

### Installation
```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://..."

# AWS (for file uploads)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="ap-southeast-2"
AWS_S3_BUCKET=""

# Email notifications
EMAIL_FROM=""
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""

# SMS notifications (optional)
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""
```

## 🏗️ Project Structure

```
variationvault/
├── README.md
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── variations/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── approve/
│   │   │   └── [id]/page.tsx
│   │   └── api/
│   │       ├── variations/
│   │       ├── approvals/
│   │       ├── uploads/
│   │       └── export/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── PhotoUpload.tsx
│   │   └── CostCalculator.tsx
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── email.ts
│   │   ├── pdf.ts
│   │   └── upload.ts
│   └── types/
│       └── index.ts
├── components/
├── public/
│   ├── manifest.json
│   └── icons/
└── types/
```

## 📡 API Endpoints

### Variations
- `GET /api/variations` - List all variations
- `POST /api/variations` - Create new variation
- `GET /api/variations/[id]` - Get variation details
- `PUT /api/variations/[id]` - Update variation

### Approvals
- `POST /api/approvals` - Submit approval/rejection

### File Handling
- `POST /api/uploads` - Upload photos/documents
- `POST /api/export` - Export variation to PDF

## 🔐 Security Features

- **Data encryption** at rest and in transit
- **Australian privacy compliance** (Privacy Act 1988)
- **Secure file handling** with virus scanning
- **Multi-factor authentication** (optional)
- **Audit trail** for all actions
- **HTTPS everywhere** with security headers

## 📊 Performance Optimizations

- **Image compression** automatic optimization
- **Lazy loading** for photos and components
- **Service worker** for offline functionality
- **CDN integration** for global performance
- **Database indexing** for fast queries
- **Caching strategy** for frequent operations

## 🚀 Deployment

### AWS Infrastructure
```bash
# Deploy with Terraform (coming soon)
cd infrastructure/
terraform init
terraform plan
terraform apply
```

### Vercel Deployment
```bash
# Quick deployment to Vercel
vercel --prod
```

### Docker Deployment
```bash
# Build and run with Docker
docker build -t variationvault .
docker run -p 3000:3000 variationvault
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Run mobile tests
npm run test:mobile
```

## 📈 Business Metrics

### Key Performance Indicators
- **Variation creation time** - Target: <60 seconds
- **Approval response time** - Target: <30 seconds  
- **Export generation time** - Target: <15 seconds
- **Client satisfaction score** - Target: >4.5/5
- **Mobile usage percentage** - Target: >80%

### Revenue Model
- **Per-tradie subscription**: $29/month
- **Enterprise plans**: $99/month (unlimited)
- **Transaction fees**: 2% of approved variation value
- **Integration fees**: $199 setup per system

## 🔄 Workflow

1. **Tradie creates variation** on mobile (<60s)
2. **Photos attached** via camera or upload
3. **Cost calculated** with GST automatically
4. **Client notified** via SMS/email instantly
5. **Client approves** on mobile (<30s)
6. **PDF generated** and sent to all parties (<15s)
7. **Accounting integration** updates job costs

## 🎨 Design System

- **Colors**: Blue primary (#2563eb), success green, warning amber
- **Typography**: Inter font family for readability
- **Spacing**: 8px grid system for consistency
- **Icons**: Heroicons for UI consistency
- **Mobile-first**: 375px minimum width support

## 🌏 Australian Market Focus

- **GST calculation** built-in (10%)
- **Australian date/time** formats
- **AUD currency** formatting
- **Business terminology** specific to trades
- **Local compliance** with building codes
- **Data sovereignty** (Australian servers)

## 📝 License

Proprietary software for VariationVault Pty Ltd.

---

**VariationVault** - Streamlining variation approvals for Australian tradies since 2026.
