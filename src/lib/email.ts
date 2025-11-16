import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOfficialResponseEmail({
  to,
  recipientName,
  issueTitle,
  issueId,
  officialResponse,
  respondedBy,
  city,
}: {
  to: string
  recipientName: string
  issueTitle: string
  issueId: string
  officialResponse: string
  respondedBy: string
  city: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'People\'s Voice <onboarding@resend.dev>',
      to: [to],
      subject: `Official Response to Your Issue: ${issueTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
              }
              .content {
                background-color: #ffffff;
                padding: 30px;
                border: 1px solid #e5e7eb;
                border-top: none;
              }
              .response-box {
                background-color: #dbeafe;
                border-left: 4px solid #2563eb;
                padding: 20px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .response-box h3 {
                color: #1e40af;
                margin-top: 0;
                margin-bottom: 10px;
              }
              .button {
                display: inline-block;
                background-color: #2563eb;
                color: white !important;
                padding: 14px 28px;
                text-decoration: none;
                border-radius: 6px;
                margin-top: 20px;
                font-weight: 600;
              }
              .footer {
                text-align: center;
                color: #6b7280;
                font-size: 12px;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
              }
              .footer a {
                color: #2563eb;
                text-decoration: none;
              }
              .issue-title {
                color: #1e40af;
                font-size: 20px;
                margin: 20px 0 10px 0;
              }
              .badge {
                display: inline-block;
                background-color: #3b82f6;
                color: white;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🏛️ People's Voice</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">Official Response to Your Issue</p>
            </div>
            
            <div class="content">
              <p>Hello ${recipientName},</p>
              
              <p>Great news! A city official in <strong>${city}</strong> has responded to your issue.</p>
              
              <h2 class="issue-title">${issueTitle}</h2>
              <span class="badge">📍 ${city}</span>
              
              <div class="response-box">
                <h3>Official Response</h3>
                <p style="white-space: pre-wrap; margin: 0 0 15px 0;">${officialResponse}</p>
                <p style="margin: 0; color: #374151; font-size: 14px;">
                  <strong>— ${respondedBy}</strong>
                </p>
              </div>
              
              <p>This response is now visible to everyone in your community. You can view the full discussion and join the conversation:</p>
              
              <center>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/issue/${issueId}" class="button">
                  View Issue & Discussion
                </a>
              </center>
              
              <p style="margin-top: 30px; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                💡 <strong>Tip:</strong> Share your issue with your neighbors to get more community support!
              </p>
            </div>
            
            <div class="footer">
              <p><strong>People's Voice</strong> - Empowering communities through civic engagement</p>
              <p style="margin-top: 10px;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/settings">Notification Settings</a> •
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/privacy">Privacy Policy</a>
              </p>
              <p style="margin-top: 15px; font-size: 11px;">
                You're receiving this because you created an issue on People's Voice.<br>
                © 2025 People's Voice. All rights reserved.
              </p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending email:', error)
      return { success: false, error }
    }

    console.log('Email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Error in sendOfficialResponseEmail:', error)
    return { success: false, error }
  }
}