'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationCode(email: string, code: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'People\'s Voice <noreply@peoplesvoicema.com>',
      to: email,
      subject: 'Your People\'s Voice Sign-In Code',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #1e3a8a; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">People's Voice</h1>
              <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Civic Engagement Platform</p>
            </div>
            
            <div style="background-color: #f9fafb; padding: 40px 30px; border-radius: 0 0 8px 8px;">
              <h2 style="color: #1e3a8a; margin-top: 0;">Your Sign-In Code</h2>
              
              <p style="font-size: 16px; color: #4b5563;">
                Use the following code to sign in to your People's Voice account:
              </p>
              
              <div style="background-color: white; border: 2px solid #1e3a8a; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e3a8a; font-family: 'Courier New', monospace;">
                  ${code}
                </div>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">
                This code will expire in 10 minutes. If you didn't request this code, you can safely ignore this email.
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
              <p>People's Voice - Massachusetts Civic Engagement</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending email:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending verification code:', error)
    return { success: false, error: 'Failed to send verification code' }
  }
}