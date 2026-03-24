import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { CreateProjectDto } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const clientId = request.nextUrl.searchParams.get('clientId')

    const projects = await prisma.project.findMany({
      where: clientId ? { clientId } : undefined,
      orderBy: { name: 'asc' },
      include: {
        client: true,
      },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateProjectDto = await request.json()

    if (!body.clientId || !body.code || !body.name || !body.address || !body.suburb || !body.state || !body.postcode) {
      return NextResponse.json({ error: 'Missing required project fields' }, { status: 400 })
    }

    const project = await prisma.project.create({
      data: {
        clientId: body.clientId,
        code: body.code.trim(),
        name: body.name.trim(),
        address: body.address.trim(),
        suburb: body.suburb.trim(),
        state: body.state.trim().toUpperCase(),
        postcode: body.postcode.trim(),
      },
      include: {
        client: true,
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
