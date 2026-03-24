export type ApprovalDecision = 'approved' | 'rejected' | 'changes_requested'

export type CreateVariationFormState = {
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

export function buildCreateVariationPayload(formState: CreateVariationFormState) {
  return {
    projectId: formState.projectId,
    description: formState.description,
    measurements: formState.measurements,
    totalArea: formState.totalArea,
    items: formState.items,
    totalLabor: formState.totalLabor,
    totalMaterials: formState.totalMaterials,
    tax: formState.tax,
    notes: formState.notes?.trim() || undefined,
    images: formState.images ?? [],
  }
}

export function getVariationImages(variation: { versionHistory?: Array<{ images?: string[] | null }> }) {
  return variation.versionHistory?.flatMap((entry) => entry.images ?? []) ?? []
}

export function normalizeApprovalDecision(decision: ApprovalDecision) {
  switch (decision) {
    case 'approved':
      return 'APPROVED'
    case 'rejected':
      return 'REJECTED'
    default:
      return 'CHANGES_REQUESTED'
  }
}
