import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildCreateVariationPayload,
  normalizeApprovalDecision,
} from '../../src/lib/variation-contract.ts'

test('buildCreateVariationPayload maps form state into the richer variation dto', () => {
  const payload = buildCreateVariationPayload({
    projectId: 'proj_1',
    description: 'Install additional cabinetry and stone benchtop.',
    measurements: 'Wall A: 3.4m\nWall B: 2.8m',
    totalArea: '24 sqm',
    items: 'Cabinetry\t1\t2500.00\t2500.00\nStone\t1\t1800.00\t1800.00',
    totalLabor: 1200,
    totalMaterials: 4300,
    tax: 550,
    notes: 'Client requested matte black handles.',
  })

  assert.equal(payload.projectId, 'proj_1')
  assert.equal(payload.description, 'Install additional cabinetry and stone benchtop.')
  assert.equal(payload.measurements, 'Wall A: 3.4m\nWall B: 2.8m')
  assert.equal(payload.totalArea, '24 sqm')
  assert.equal(payload.items, 'Cabinetry\t1\t2500.00\t2500.00\nStone\t1\t1800.00\t1800.00')
  assert.equal(payload.totalLabor, 1200)
  assert.equal(payload.totalMaterials, 4300)
  assert.equal(payload.tax, 550)
  assert.equal(payload.notes, 'Client requested matte black handles.')
})

test('normalizeApprovalDecision converts page decisions into approval api statuses', () => {
  assert.equal(normalizeApprovalDecision('approved'), 'APPROVED')
  assert.equal(normalizeApprovalDecision('rejected'), 'REJECTED')
  assert.equal(normalizeApprovalDecision('changes_requested'), 'CHANGES_REQUESTED')
})
