export interface Variation {
  id: string
  projectId: string
  description: string
  measurements: string
  totalArea: string
  items: string
  totalLabor: number
  totalMaterials: number
  tax: number
  total: number
  notes?: string | null
  status: 'DRAFT' | 'SENT' | 'CLIENT_REVIEW' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED'
  pdfUrl?: string
  version: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
  project: Project
  versionHistory?: VariationVersion[]
  approvals?: Approvals[]
}

export interface VariationVersion {
  id: string
  variationId: string
  version: number
  images: string[]
  changes: string
  updatedAt: Date
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  company?: string | null
  createdAt: Date
  updatedAt: Date
  projects?: Project[]
}

export interface Project {
  id: string
  clientId: string
  code: string
  name: string
  address: string
  suburb: string
  state: string
  postcode: string
  createdAt: Date
  updatedAt: Date
  client: Client
  variations?: Variation[]
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
  description: string
  measurements: string
  totalArea: string
  items: string
  totalLabor: number
  totalMaterials: number
  tax: number
  notes?: string
  images?: string[]
}

export interface CreateClientDto {
  name: string
  email: string
  phone: string
  company?: string
}

export interface CreateProjectDto {
  clientId: string
  code: string
  name: string
  address: string
  suburb: string
  state: string
  postcode: string
}

export interface ApprovalUpdateDto {
  status: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED'
  comments?: string
  variationId: string
  signature?: string
}
