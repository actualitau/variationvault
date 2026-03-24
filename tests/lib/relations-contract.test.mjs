import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildRelationBackfillRecords,
  mapRelationVariationToSummary,
  mapRelationVariationToDetail,
} from '../../src/lib/relations.ts'

test('buildRelationBackfillRecords collapses duplicate client and project identities', () => {
  const records = buildRelationBackfillRecords([
    {
      id: 'var_1',
      projectId: 'P-100',
      projectName: 'Kitchen Renovation',
      clientName: 'Sam Carter',
      clientEmail: 'sam@example.com',
      clientPhone: '0412 345 678',
      address: '10 Queen Street',
      suburb: 'Brisbane',
      state: 'QLD',
      postcode: '4000',
    },
    {
      id: 'var_2',
      projectId: 'P-100',
      projectName: 'Kitchen Renovation',
      clientName: 'Sam Carter',
      clientEmail: 'sam@example.com',
      clientPhone: '0412345678',
      address: '10 Queen Street',
      suburb: 'Brisbane',
      state: 'QLD',
      postcode: '4000',
    },
    {
      id: 'var_3',
      projectId: 'P-200',
      projectName: 'Bathroom Upgrade',
      clientName: 'Sam Carter',
      clientEmail: 'sam@example.com',
      clientPhone: '0412345678',
      address: '22 James Street',
      suburb: 'New Farm',
      state: 'QLD',
      postcode: '4005',
    },
  ])

  assert.equal(records.clients.length, 1)
  assert.equal(records.projects.length, 2)
  assert.equal(records.links.length, 3)
  assert.equal(records.clients[0].phone, '0412345678')
  assert.equal(records.projects[0].clientKey, records.clients[0].key)
})

test('mapRelationVariationToSummary surfaces project and client relation data', () => {
  const summary = mapRelationVariationToSummary({
    id: 'var_1',
    total: 6050,
    status: 'SENT',
    approvalStatus: 'PENDING',
    createdAt: '2026-03-24T00:00:00.000Z',
    project: {
      id: 'proj_1',
      code: 'P-100',
      name: 'Kitchen Renovation',
      client: {
        id: 'client_1',
        name: 'Sam Carter',
        email: 'sam@example.com',
      },
    },
  })

  assert.deepEqual(summary, {
    id: 'var_1',
    projectId: 'proj_1',
    projectCode: 'P-100',
    projectName: 'Kitchen Renovation',
    clientName: 'Sam Carter',
    clientEmail: 'sam@example.com',
    total: 6050,
    status: 'SENT',
    approvalStatus: 'PENDING',
    createdAt: '2026-03-24T00:00:00.000Z',
  })
})

test('mapRelationVariationToDetail exposes joined project and client data for the UI', () => {
  const detail = mapRelationVariationToDetail({
    id: 'var_1',
    description: 'Install additional cabinetry.',
    measurements: 'Wall A: 3.4m',
    totalArea: '24 sqm',
    items: 'Cabinetry\t1\t2500.00\t2500.00',
    totalLabor: 1200,
    totalMaterials: 4300,
    tax: 550,
    total: 6050,
    notes: 'Client requested matte black handles.',
    status: 'SENT',
    approvalStatus: 'PENDING',
    pdfUrl: 'https://blob.example/export.pdf',
    version: 1,
    createdAt: '2026-03-24T00:00:00.000Z',
    updatedAt: '2026-03-24T01:00:00.000Z',
    versionHistory: [{ images: ['https://blob.example/image.jpg'] }],
    approvals: [],
    project: {
      id: 'proj_1',
      code: 'P-100',
      name: 'Kitchen Renovation',
      address: '10 Queen Street',
      suburb: 'Brisbane',
      state: 'QLD',
      postcode: '4000',
      client: {
        id: 'client_1',
        name: 'Sam Carter',
        email: 'sam@example.com',
        phone: '0412345678',
      },
    },
  })

  assert.equal(detail.projectId, 'proj_1')
  assert.equal(detail.projectCode, 'P-100')
  assert.equal(detail.projectName, 'Kitchen Renovation')
  assert.equal(detail.clientName, 'Sam Carter')
  assert.equal(detail.clientEmail, 'sam@example.com')
  assert.equal(detail.clientPhone, '0412345678')
  assert.equal(detail.address, '10 Queen Street')
})
