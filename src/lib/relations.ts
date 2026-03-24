type LegacyVariationIdentity = {
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
}

type RelationSummaryInput = {
  id: string
  total: number
  status: string
  approvalStatus: string
  createdAt: string
  project: {
    id: string
    code: string
    name: string
    client: {
      id: string
      name: string
      email: string
    }
  }
}

type RelationDetailInput = {
  id: string
  description: string
  measurements: string
  totalArea: string
  items: string
  totalLabor: number
  totalMaterials: number
  tax: number
  total: number
  notes?: string | null
  status: string
  approvalStatus: string
  pdfUrl?: string | null
  version: number
  createdAt: string
  updatedAt: string
  versionHistory: Array<{ images?: string[] | null }>
  approvals: unknown[]
  project: {
    id: string
    code: string
    name: string
    address: string
    suburb: string
    state: string
    postcode: string
    client: {
      id: string
      name: string
      email: string
      phone: string
    }
  }
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, '')
}

function normalizeText(value: string) {
  return value.trim().toLowerCase()
}

function getClientKey(record: LegacyVariationIdentity) {
  return `${normalizeText(record.clientName)}::${normalizeText(record.clientEmail)}::${normalizePhone(record.clientPhone)}`
}

function getProjectKey(record: LegacyVariationIdentity) {
  return `${getClientKey(record)}::${normalizeText(record.projectId)}::${normalizeText(record.projectName)}::${normalizeText(record.address)}::${normalizeText(record.postcode)}`
}

export function buildRelationBackfillRecords(records: LegacyVariationIdentity[]) {
  const clients = new Map<
    string,
    {
      key: string
      name: string
      email: string
      phone: string
    }
  >()
  const projects = new Map<
    string,
    {
      key: string
      clientKey: string
      code: string
      name: string
      address: string
      suburb: string
      state: string
      postcode: string
    }
  >()

  const links = records.map((record) => {
    const clientKey = getClientKey(record)
    const projectKey = getProjectKey(record)

    if (!clients.has(clientKey)) {
      clients.set(clientKey, {
        key: clientKey,
        name: record.clientName.trim(),
        email: record.clientEmail.trim(),
        phone: normalizePhone(record.clientPhone),
      })
    }

    if (!projects.has(projectKey)) {
      projects.set(projectKey, {
        key: projectKey,
        clientKey,
        code: record.projectId.trim(),
        name: record.projectName.trim(),
        address: record.address.trim(),
        suburb: record.suburb.trim(),
        state: record.state.trim(),
        postcode: record.postcode.trim(),
      })
    }

    return {
      variationId: record.id,
      clientKey,
      projectKey,
    }
  })

  return {
    clients: Array.from(clients.values()),
    projects: Array.from(projects.values()),
    links,
  }
}

export function mapRelationVariationToSummary(variation: RelationSummaryInput) {
  return {
    id: variation.id,
    projectId: variation.project.id,
    projectCode: variation.project.code,
    projectName: variation.project.name,
    clientName: variation.project.client.name,
    clientEmail: variation.project.client.email,
    total: variation.total,
    status: variation.status,
    approvalStatus: variation.approvalStatus,
    createdAt: variation.createdAt,
  }
}

export function mapRelationVariationToDetail(variation: RelationDetailInput) {
  return {
    id: variation.id,
    projectId: variation.project.id,
    projectCode: variation.project.code,
    projectName: variation.project.name,
    clientName: variation.project.client.name,
    clientEmail: variation.project.client.email,
    clientPhone: variation.project.client.phone,
    address: variation.project.address,
    suburb: variation.project.suburb,
    state: variation.project.state,
    postcode: variation.project.postcode,
    description: variation.description,
    measurements: variation.measurements,
    totalArea: variation.totalArea,
    items: variation.items,
    totalLabor: variation.totalLabor,
    totalMaterials: variation.totalMaterials,
    tax: variation.tax,
    total: variation.total,
    notes: variation.notes,
    status: variation.status,
    approvalStatus: variation.approvalStatus,
    pdfUrl: variation.pdfUrl,
    version: variation.version,
    createdAt: variation.createdAt,
    updatedAt: variation.updatedAt,
    versionHistory: variation.versionHistory,
    approvals: variation.approvals,
  }
}
