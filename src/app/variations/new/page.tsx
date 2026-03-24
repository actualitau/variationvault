'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '../../../components/Header'
import { PhotoUpload } from '../../../components/PhotoUpload'
import { CostCalculator } from '../../../components/CostCalculator'
import { buildCreateVariationPayload } from '@/lib/variation-contract'

type ClientOption = {
  id: string
  name: string
  email: string
  phone: string
}

type ProjectOption = {
  id: string
  clientId: string
  code: string
  name: string
  address: string
  suburb: string
  state: string
  postcode: string
}

const initialFormData = {
  projectId: '',
  description: '',
  measurements: '',
  totalArea: '',
  items: '',
  totalLabor: 0,
  totalMaterials: 0,
  tax: 0,
  notes: '',
  images: [] as string[],
}

const initialClientDraft = {
  name: '',
  email: '',
  phone: '',
  company: '',
}

const initialProjectDraft = {
  code: '',
  name: '',
  address: '',
  suburb: '',
  state: 'QLD',
  postcode: '',
}

export default function NewVariationPage() {
  const router = useRouter()
  const [clients, setClients] = useState<ClientOption[]>([])
  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [selectedClientId, setSelectedClientId] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [createClientInline, setCreateClientInline] = useState(false)
  const [createProjectInline, setCreateProjectInline] = useState(false)
  const [clientDraft, setClientDraft] = useState(initialClientDraft)
  const [projectDraft, setProjectDraft] = useState(initialProjectDraft)
  const [formData, setFormData] = useState(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadClients = async () => {
      const response = await fetch('/api/clients')
      if (!response.ok) return
      const data = await response.json()
      setClients(data)
    }

    void loadClients()
  }, [])

  useEffect(() => {
    const loadProjects = async () => {
      if (!selectedClientId) {
        setProjects([])
        return
      }

      const response = await fetch(`/api/projects?clientId=${selectedClientId}`)
      if (!response.ok) return
      const data = await response.json()
      setProjects(data)
    }

    void loadProjects()
  }, [selectedClientId])

  const updateCosts = (materials: number, labor: number, tax: number) => {
    setFormData((current) => ({
      ...current,
      totalMaterials: materials,
      totalLabor: labor,
      tax,
    }))
  }

  const resolveClientId = async () => {
    if (!createClientInline) return selectedClientId

    const response = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientDraft),
    })

    if (!response.ok) {
      throw new Error('Failed to create client')
    }

    const client = await response.json()
    setClients((current) => [...current, client].sort((a, b) => a.name.localeCompare(b.name)))
    setSelectedClientId(client.id)
    return client.id
  }

  const resolveProjectId = async (clientId: string) => {
    if (!createProjectInline) return selectedProjectId

    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        ...projectDraft,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create project')
    }

    const project = await response.json()
    setProjects((current) => [...current, project].sort((a, b) => a.name.localeCompare(b.name)))
    setSelectedProjectId(project.id)
    return project.id
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const clientId = await resolveClientId()
      if (!clientId) {
        throw new Error('Client is required')
      }

      const projectId = await resolveProjectId(clientId)
      if (!projectId) {
        throw new Error('Project is required')
      }

      const response = await fetch('/api/variations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildCreateVariationPayload({ ...formData, projectId })),
      })

      if (!response.ok) {
        throw new Error('Failed to create estimate')
      }

      const variation = await response.json()
      router.push(`/variations/${variation.id}`)
    } catch (error) {
      console.error('Error creating estimate:', error)
      alert('Failed to create estimate')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">New Estimate</p>
          <h1 className="text-3xl font-bold text-gray-900">Create a project variation</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Select an existing client and project, or create them inline before saving the estimate.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-xl bg-white p-4 shadow">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Client</h2>
              <button
                type="button"
                onClick={() => setCreateClientInline((current) => !current)}
                className="text-sm font-medium text-blue-600"
              >
                {createClientInline ? 'Use Existing Client' : 'Create New Client'}
              </button>
            </div>

            {createClientInline ? (
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="text"
                  value={clientDraft.name}
                  onChange={(event) => setClientDraft((current) => ({ ...current, name: event.target.value }))}
                  className="form-input"
                  placeholder="Client name"
                  required
                />
                <input
                  type="email"
                  value={clientDraft.email}
                  onChange={(event) => setClientDraft((current) => ({ ...current, email: event.target.value }))}
                  className="form-input"
                  placeholder="client@example.com"
                  required
                />
                <input
                  type="tel"
                  value={clientDraft.phone}
                  onChange={(event) => setClientDraft((current) => ({ ...current, phone: event.target.value }))}
                  className="form-input"
                  placeholder="0412 345 678"
                  required
                />
                <input
                  type="text"
                  value={clientDraft.company}
                  onChange={(event) => setClientDraft((current) => ({ ...current, company: event.target.value }))}
                  className="form-input"
                  placeholder="Company (optional)"
                />
              </div>
            ) : (
              <select
                value={selectedClientId}
                onChange={(event) => {
                  setSelectedClientId(event.target.value)
                  setSelectedProjectId('')
                }}
                className="form-input"
                required
              >
                <option value="">Select client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} · {client.email}
                  </option>
                ))}
              </select>
            )}
          </section>

          <section className="rounded-xl bg-white p-4 shadow">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Project</h2>
              <button
                type="button"
                onClick={() => setCreateProjectInline((current) => !current)}
                className="text-sm font-medium text-blue-600"
              >
                {createProjectInline ? 'Use Existing Project' : 'Create New Project'}
              </button>
            </div>

            {createProjectInline ? (
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="text"
                  value={projectDraft.code}
                  onChange={(event) => setProjectDraft((current) => ({ ...current, code: event.target.value }))}
                  className="form-input"
                  placeholder="Project code"
                  required
                />
                <input
                  type="text"
                  value={projectDraft.name}
                  onChange={(event) => setProjectDraft((current) => ({ ...current, name: event.target.value }))}
                  className="form-input"
                  placeholder="Project name"
                  required
                />
                <input
                  type="text"
                  value={projectDraft.address}
                  onChange={(event) => setProjectDraft((current) => ({ ...current, address: event.target.value }))}
                  className="form-input md:col-span-2"
                  placeholder="Street address"
                  required
                />
                <input
                  type="text"
                  value={projectDraft.suburb}
                  onChange={(event) => setProjectDraft((current) => ({ ...current, suburb: event.target.value }))}
                  className="form-input"
                  placeholder="Suburb"
                  required
                />
                <input
                  type="text"
                  value={projectDraft.state}
                  onChange={(event) => setProjectDraft((current) => ({ ...current, state: event.target.value.toUpperCase() }))}
                  className="form-input"
                  placeholder="State"
                  required
                />
                <input
                  type="text"
                  value={projectDraft.postcode}
                  onChange={(event) => setProjectDraft((current) => ({ ...current, postcode: event.target.value }))}
                  className="form-input"
                  placeholder="Postcode"
                  required
                />
              </div>
            ) : (
              <select
                value={selectedProjectId}
                onChange={(event) => setSelectedProjectId(event.target.value)}
                className="form-input"
                required
                disabled={!selectedClientId}
              >
                <option value="">{selectedClientId ? 'Select project' : 'Select client first'}</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.code} · {project.name}
                  </option>
                ))}
              </select>
            )}
          </section>

          <section className="rounded-xl bg-white p-4 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Scope & Measurements</h2>

            <div className="space-y-4">
              <textarea
                value={formData.description}
                onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
                className="form-input"
                rows={4}
                placeholder="Describe the additional scope and deliverables."
                required
              />
              <textarea
                value={formData.measurements}
                onChange={(event) => setFormData((current) => ({ ...current, measurements: event.target.value }))}
                className="form-input"
                rows={4}
                placeholder="Wall A: 3.4m&#10;Wall B: 2.8m&#10;Ceiling height: 2.7m"
                required
              />
              <input
                type="text"
                value={formData.totalArea}
                onChange={(event) => setFormData((current) => ({ ...current, totalArea: event.target.value }))}
                className="form-input"
                placeholder="24 sqm"
                required
              />
              <textarea
                value={formData.items}
                onChange={(event) => setFormData((current) => ({ ...current, items: event.target.value }))}
                className="form-input font-mono text-sm"
                rows={6}
                placeholder={'Cabinetry\t1\t2500.00\t2500.00\nStone\t1\t1800.00\t1800.00'}
                required
              />
              <textarea
                value={formData.notes}
                onChange={(event) => setFormData((current) => ({ ...current, notes: event.target.value }))}
                className="form-input"
                rows={3}
                placeholder="Internal or client-facing notes."
              />
            </div>
          </section>

          <PhotoUpload
            photos={formData.images}
            onPhotosChange={(images) => setFormData((current) => ({ ...current, images }))}
          />

          <CostCalculator onCostUpdate={updateCosts} />

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center">
            {isSubmitting ? 'Creating Estimate...' : 'Create Estimate'}
          </button>
        </form>
      </div>
    </div>
  )
}
