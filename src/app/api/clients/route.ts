import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { CreateClientDto } from '@/types'

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { name: 'asc' },
      include: {
        projects: {
          orderBy: { name: 'asc' },
        },
      },
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateClientDto = await request.json()

    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json({ error: 'Missing required client fields' }, { status: 400 })
    }

    const client = await prisma.client.create({
      data: {
        name: body.name.trim(),
        email: body.email.trim(),
        phone: body.phone.replace(/\D/g, ''),
        company: body.company?.trim() || undefined,
      },
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
  }
}
