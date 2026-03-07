export interface Variation {
  id: string
  projectId: string
  projectName: string
  clientName: string
  clientEmail: string
  clientPhone: string
  address: string
  suburb: string
  state: string
  postcode: string
  description: string
  measurements: string
  totalArea: string
  items: string
  totalLabor: number
  totalMaterials: number
  tax: number
  total: number
  notes?: string
  status: 'DRAFT' | 'SENT' | 'CLIENT_REVIEW' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED'
  pdfUrl?: string
  version: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
  versionHistory: VariationVersion[]
  variations: VariationVersion[]
}

export interface VariationVersion {
  id: string
  variationId: string
  version: number
  images: string[]
  changes: string
  updatedAt: Date
}

export interface Approvals {
  id: string
  variationId: string
  clientId?: string
  email: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED'
  comments?: string
  notified: boolean
  notifiedAt?: Date
  ipAddr?: string
  userAgent?: string
  createdAt: Date
  updatedAt: Date
  variation: Variation
}

export interface Notification {
  id: string
  variationId: string
  type: 'EMAIL' | 'SMS' | 'WHATSAPP'
  status: 'PENDING' | 'SENT' | 'FAILED'
  recipient: string
  message?: string
  error?: string
  tries: number
  createdAt: Date
  updatedAt: Date
  variation: Variation
}

export interface Settings {
  id: string
  company: string
  email?: string
  smsProvider?: string
  emailProvider?: string
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  email: string
  password: string
  role: 'admin' | 'tradies'
  createdAt: Date
  updatedAt: Date
}

export interface CreateVariationDto {
  projectId: string
  projectName: string
  clientName: string
  clientEmail: string
  clientPhone: string
  address: string
  suburb: string
  state: string
  postcode: string
  description: string
  measurements: string
  totalArea: string
  items: string
  totalLabor: number
  totalMaterials: number
  tax: number
  notes?: string
}

export interface ApprovalUpdateDto {
  status: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED'
  comments?: string
}
