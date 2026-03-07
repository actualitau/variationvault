import prisma from './prisma'
import { ApprovalUpdateDto, Variation } from '@types/index'

export async function sendApprovalEmail(
  variation: Variation,
  email: string,
  action: 'approve' | 'reject' | 'changes',
  comments?: string
) {
  const subject = `${action === 'approve' ? 'Approved' : action === 'reject' ? 'Rejected' : 'Action Required'}: ${variation.projectName}`
  const message = `
Hello ${variation.clientName},

Your estimate for "${variation.projectName}" has been ${action}.

${comments ? `Comments: ${comments}\n\n` : ''}
View the full estimate: https://variationvault.com/estimates/${variation.id}

Best regards,
${variation.company || 'Your Company'}
  `.trim()

  try {
    // TODO: Integrate with email service (SendGrid, Mailgun, etc.)
    // For now, log to notification table
    await prisma.notifications.create({
      data: {
        variationId: variation.id,
        type: 'EMAIL',
        status: 'SENT',
        recipient: email,
        message: subject,
      },
    })
    
    return { success: true }
  } catch (error) {
    await prisma.notifications.create({
      data: {
        variationId: variation.id,
        type: 'EMAIL',
        status: 'FAILED',
        recipient: email,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    })
    
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function sendSmsMessage(phone: string, message: string) {
  try {
    // TODO: Integrate with SMS service (Twilio, etc.)
    await prisma.notifications.create({
      data: {
        variationId: new Date().toISOString(), // Placeholder
        type: 'SMS',
        status: 'SENT',
        recipient: phone,
        message,
      },
    })
    
    return { success: true }
  } catch (error) {
    await prisma.notifications.create({
      data: {
        variationId: new Date().toISOString(), // Placeholder
        type: 'SMS',
        status: 'FAILED',
        recipient: phone,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    })
    
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
