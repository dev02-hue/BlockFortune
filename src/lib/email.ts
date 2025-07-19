import nodemailer from 'nodemailer'

interface VerificationRequest {
  userEmail: string
  userId: string
  userName: string
  documentType: string
  verificationId: string
}

export async function sendDepositEmailToAdmin(params: {
  userEmail: string
  amount: number
  reference: string
  userId: string
  cryptoType: string
  transactionId: string
  planName?: string
}) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    const mailOptions = {
      from: `BlockFortune <${process.env.EMAIL_USERNAME}>`,
      to: process.env.ADMIN_EMAIL || 'admin@blockfortune.com',
      subject: `New Deposit Request - ${params.amount} USD (${params.cryptoType})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2a52be;">New Deposit Request</h2>
          <p><strong>User ID:</strong> ${params.userId}</p>
          <p><strong>User Email:</strong> ${params.userEmail}</p>
          <p><strong>Amount:</strong> ${params.amount} USD</p>
          <p><strong>Crypto Type:</strong> ${params.cryptoType}</p>
          <p><strong>Reference:</strong> ${params.reference}</p>
          <p><strong>Transaction ID:</strong> ${params.transactionId}</p>
          
          <p style="margin-top: 30px;">
            <a href="${process.env.ADMIN_DASHBOARD_URL}/deposits/${params.transactionId}/approve" 
               style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Approve Deposit
            </a>
            <a href="${process.env.ADMIN_DASHBOARD_URL}/deposits/${params.transactionId}/reject" 
               style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-left: 10px;">
              Reject Deposit
            </a>
          </p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log('Admin notification sent for deposit:', params.reference)
  } catch (error) {
    console.error('Failed to send admin notification:', error)
  }
}

export async function sendDepositConfirmationToUser(params: {
  userEmail: string
  amount: number
  cryptoType: string
  cryptoAmount?: number
}) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    const amountDisplay = params.cryptoAmount 
      ? `${params.cryptoAmount.toFixed(8)} ${params.cryptoType} (≈ $${params.amount.toFixed(2)})`
      : `$${params.amount.toFixed(2)}`

    const mailOptions = {
      from: `BlockFortune <${process.env.EMAIL_USERNAME}>`,
      to: params.userEmail,
      subject: `Your Deposit of ${amountDisplay} Has Been Processed`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2a52be;">Deposit Confirmed</h2>
          <p>Dear Valued Member,</p>
          
          <p>We're pleased to confirm that your deposit of <strong>${amountDisplay}</strong> 
          has been successfully credited to your BlockFortune account.</p>
          
          <p>Your funds are now available for investment in our various plans.</p>
          
          <p>Thank you for choosing BlockFortune for your investment needs.</p>
          
          <p style="margin-top: 30px;">Best regards,<br>
          The BlockFortune Team</p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log('Deposit confirmation sent to:', params.userEmail)
  } catch (error) {
    console.error('Failed to send deposit confirmation:', error)
  }
}


export async function sendWithdrawalEmailToAdmin(params: {
  userEmail: string
  amount: number
  reference: string
  userId: string
  cryptoType: string
  walletAddress: string
  transactionId: string
  fee: number
}) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    const mailOptions = {
      from: `BlockFortune <${process.env.EMAIL_USERNAME}>`,
      to: process.env.ADMIN_EMAIL || 'admin@blockfortune.com',
      subject: `New Withdrawal Request - ${params.amount} USD (${params.cryptoType})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2a52be;">New Withdrawal Request</h2>
          <p><strong>User ID:</strong> ${params.userId}</p>
          <p><strong>User Email:</strong> ${params.userEmail}</p>
          <p><strong>Amount:</strong> ${params.amount} USD</p>
          <p><strong>Crypto Type:</strong> ${params.cryptoType}</p>
          <p><strong>Wallet Address:</strong> ${params.walletAddress}</p>
          <p><strong>Network Fee:</strong> ${params.fee} ${params.cryptoType}</p>
          <p><strong>Reference:</strong> ${params.reference}</p>
          <p><strong>Transaction ID:</strong> ${params.transactionId}</p>
          
          <p style="margin-top: 30px;">
            <a href="${process.env.ADMIN_DASHBOARD_URL}/withdrawals/${params.transactionId}/approve" 
               style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Approve Withdrawal
            </a>
            <a href="${process.env.ADMIN_DASHBOARD_URL}/withdrawals/${params.transactionId}/reject" 
               style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-left: 10px;">
              Reject Withdrawal
            </a>
          </p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log('Admin notification sent for withdrawal:', params.reference)
  } catch (error) {
    console.error('Failed to send admin notification:', error)
  }
}

export async function sendWithdrawalConfirmationToUser(params: {
  userEmail: string
  amount: number
  cryptoType: string
  walletAddress: string
}) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    const mailOptions = {
      from: `BlockFortune <${process.env.EMAIL_USERNAME}>`,
      to: params.userEmail,
      subject: `Your Withdrawal of $${params.amount.toFixed(2)} Has Been Processed`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2a52be;">Withdrawal Confirmed</h2>
          <p>Dear Valued Member,</p>
          
          <p>We're pleased to confirm that your withdrawal of <strong>$${params.amount.toFixed(2)}</strong> 
          has been successfully processed and sent to your wallet:</p>
          
          <p><strong>Wallet Address:</strong> ${params.walletAddress}</p>
          <p><strong>Network:</strong> ${params.cryptoType}</p>
          
          <p>Please allow some time for the transaction to appear in your wallet, depending on network congestion.</p>
          
          <p style="margin-top: 30px;">Thank you for choosing BlockFortune for your investment needs.</p>
          
          <p>Best regards,<br>
          The BlockFortune Team</p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log('Withdrawal confirmation sent to:', params.userEmail)
  } catch (error) {
    console.error('Failed to send withdrawal confirmation:', error)
  }
}


export async function sendVerificationRequestToAdmin(params: {
  userId: string;
  userEmail: string;
  userName: string;
  verificationId: string;
}) {
  // Implement your email sending logic here
  // This should notify admin that a new verification request needs review
  console.log(`New verification request from ${params.userName} (${params.userEmail})`, params)
}

export async function sendVerificationStatusToUser(params: {
  userEmail: string;
  userName: string;
  status: 'approved' | 'rejected';
  notes?: string;
}) {
  // Implement your email sending logic here
  // This should notify user about their verification status
  console.log(`Verification ${params.status} for ${params.userName} (${params.userEmail})`, params)
}

export async function sendVerificationEmailToAdmin(request: VerificationRequest) {
  // In a real app, you would send an email here
  // For this fake version, we'll just log to console
  
  console.log('--- ADMIN NOTIFICATION ---')
  console.log('New verification request received:')
  console.log(`User: ${request.userName} (${request.userEmail})`)
  console.log(`User ID: ${request.userId}`)
  console.log(`Document Type: ${request.documentType}`)
  console.log(`Verification ID: ${request.verificationId}`)
  console.log('--------------------------')

  // In a real implementation, you might use:
  // - Nodemailer
  // - SendGrid
  // - AWS SES
  // - Resend
  // Or any other email service

  return { success: true }
}
