import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatCurrency } from './upload'

type PdfVariation = {
  id: string
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
  items: string
  totalLabor: number
  totalMaterials: number
  tax: number
  total: number
  notes?: string | null
  updatedAt: Date | string
}

export function generatePDF(variation: PdfVariation): ArrayBuffer {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  
  // Header
  doc.setFillColor(37, 99, 235) // Australian blue
  doc.rect(0, 0, pageWidth, 40, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('ESTIMATE', 20, 20)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Estimate #${variation.id.slice(-8).toUpperCase()}`, 20, 30)
  doc.text(new Date(variation.updatedAt).toLocaleDateString('en-AU'), pageWidth - 20, 30, { align: 'right' })
  
  // Reset text color
  doc.setTextColor(0, 0, 0)
  
  // Company & Client info
  doc.setFontSize(12)
  doc.text(variation.projectName, 20, 50)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Bill To:', 20, 60)
  
  doc.setFont('helvetica', 'normal')
  const clientInfo = `${variation.clientName}\n${variation.address}\n${variation.suburb}, ${variation.state} ${variation.postcode}\n${variation.clientEmail}\n${variation.clientPhone}`
  doc.text(clientInfo, 20, 65, { maxWidth: 100 })
  
  // Description
  doc.setFont('helvetica', 'bold')
  doc.text('Project Details:', 140, 50)
  
  doc.setFont('helvetica', 'normal')
  doc.text(variation.description, 140, 55, { maxWidth: 60 })
  
  // Measurements table
  doc.setFont('helvetica', 'bold')
  doc.text('Measurements:', 20, 95)
  
  doc.setFont('helvetica', 'normal')
  const measurementsLines = variation.measurements.split('\n').filter(Boolean)
  doc.text(measurementsLines, 20, 100, { maxWidth: 180 })
  
  // Items table
  doc.setFont('helvetica', 'bold')
  doc.text('Quote Breakdown:', 20, 180)
  
  const itemRows = variation.items.split('\n').filter(Boolean).map(line => {
    const [name, quantity, unitPrice, total] = line.split('\t')
    return [
      name || 'Item',
      quantity || '',
      unitPrice || '0.00',
      total || '0.00',
    ]
  })
  
  autoTable(doc, {
    startY: 185,
    head: [['Item', 'Qty', 'Unit Price', 'Total']],
    body: itemRows,  
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'right'
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 25, halign: 'right' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
    },
    theme: 'striped',
    margin: { top: 185 }
  })
  
  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 20
  
  doc.setFont('helvetica', 'bold')
  doc.text('Subtotal:', pageWidth - 60, finalY, { align: 'right' })
  doc.text(formatCurrency(variation.totalLabor + variation.totalMaterials), pageWidth - 20, finalY, { align: 'right' })
  
  doc.text('Tax:', pageWidth - 60, finalY + 8, { align: 'right' })
  doc.text(formatCurrency(variation.tax), pageWidth - 20, finalY + 8, { align: 'right' })
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL:', pageWidth - 60, finalY + 18, { align: 'right' })
  doc.text(formatCurrency(variation.total), pageWidth - 20, finalY + 18, { align: 'right' })
  
  // Notes and footer
  if (variation.notes) {
    const notesY = finalY + 35
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Notes:', 20, notesY)
    doc.setFont('helvetica', 'normal')
    doc.text(variation.notes, 20, notesY + 5, { maxWidth: pageWidth - 40 })
  }
  
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.text('This quote is valid for 30 days from the date above.', pageWidth / 2, 290, { align: 'center' })
  
  return doc.output('arraybuffer')
}
