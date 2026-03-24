import { PrismaClient } from '@prisma/client'
import { buildRelationBackfillRecords } from '../src/lib/relations'

const prisma = new PrismaClient()

type LegacyVariationRow = {
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
  projectRefId: string | null
}

async function main() {
  const projectRefColumn = await prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'variations'
      AND column_name = 'project_ref_id'
    ) AS "exists"
  `)

  if (!projectRefColumn[0]?.exists) {
    console.log('project_ref_id column is not present. Transitional backfill is no longer applicable.')
    return
  }

  const legacyRows = await prisma.$queryRawUnsafe<LegacyVariationRow[]>(`
    SELECT
      id,
      "projectId",
      "projectName",
      "clientName",
      "clientEmail",
      "clientPhone",
      address,
      suburb,
      state,
      postcode,
      project_ref_id AS "projectRefId"
    FROM variations
    ORDER BY "createdAt" ASC
  `)

  const pendingRows = legacyRows.filter((row) => !row.projectRefId)
  if (pendingRows.length === 0) {
    console.log('No variations require relation backfill.')
    return
  }

  const records = buildRelationBackfillRecords(pendingRows)

  const clientIdByKey = new Map<string, string>()
  const projectIdByKey = new Map<string, string>()

  for (const client of records.clients) {
    const existing = await prisma.client.findFirst({
      where: {
        name: client.name,
        email: client.email,
        phone: client.phone,
      },
    })

    if (existing) {
      clientIdByKey.set(client.key, existing.id)
      continue
    }

    const created = await prisma.client.create({
      data: {
        name: client.name,
        email: client.email,
        phone: client.phone,
      },
    })

    clientIdByKey.set(client.key, created.id)
  }

  for (const project of records.projects) {
    const clientId = clientIdByKey.get(project.clientKey)
    if (!clientId) {
      throw new Error(`Missing client id for key ${project.clientKey}`)
    }

    const existing = await prisma.project.findFirst({
      where: {
        clientId,
        code: project.code,
        name: project.name,
        address: project.address,
        suburb: project.suburb,
        state: project.state,
        postcode: project.postcode,
      },
    })

    if (existing) {
      projectIdByKey.set(project.key, existing.id)
      continue
    }

    const created = await prisma.project.create({
      data: {
        clientId,
        code: project.code,
        name: project.name,
        address: project.address,
        suburb: project.suburb,
        state: project.state,
        postcode: project.postcode,
      },
    })

    projectIdByKey.set(project.key, created.id)
  }

  for (const link of records.links) {
    const projectRefId = projectIdByKey.get(link.projectKey)
    if (!projectRefId) {
      throw new Error(`Missing project id for key ${link.projectKey}`)
    }

    await prisma.$executeRawUnsafe(
      `UPDATE variations SET project_ref_id = $1 WHERE id = $2`,
      projectRefId,
      link.variationId
    )
  }

  console.log(
    JSON.stringify(
      {
        clientsCreatedOrLinked: records.clients.length,
        projectsCreatedOrLinked: records.projects.length,
        variationsLinked: records.links.length,
      },
      null,
      2
    )
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
