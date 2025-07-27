// Email template utilities
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

// Base email template
export const baseEmailTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PowerPulse</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 10px !important; }
      .content { padding: 20px !important; }
      h1 { font-size: 24px !important; }
      .button { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
  <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">PowerPulse</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Your Daily AI Coach</p>
    </div>
    
    <!-- Content -->
    <div class="content" style="padding: 40px;">
      ${content}
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f8f8f8; padding: 30px; text-align: center; border-top: 1px solid #e5e5e5;">
      <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
        PowerPulse - Transform Your Life, 5 Minutes at a Time
      </p>
      <p style="margin: 0 0 10px 0; font-size: 12px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings/notifications" style="color: #7C3AED; text-decoration: none;">Manage Preferences</a> |
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/privacy" style="color: #7C3AED; text-decoration: none;">Privacy Policy</a> |
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/support" style="color: #7C3AED; text-decoration: none;">Support</a>
      </p>
      <p style="margin: 0; color: #999; font-size: 12px;">
        © ${new Date().getFullYear()} PowerPulse. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`

// Common components
export const emailButton = (text: string, href: string, variant: 'primary' | 'secondary' = 'primary') => {
  const styles = variant === 'primary' 
    ? 'background-color: #7C3AED; color: white;'
    : 'background-color: #f3f4f6; color: #7C3AED; border: 1px solid #7C3AED;'
    
  return `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${href}" style="${styles} display: inline-block; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        ${text}
      </a>
    </div>
  `
}

export const emailCallout = (content: string, type: 'info' | 'success' | 'warning' = 'info') => {
  const colors = {
    info: { bg: '#EFF6FF', border: '#3B82F6', text: '#1E40AF' },
    success: { bg: '#F0FDF4', border: '#22C55E', text: '#166534' },
    warning: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E' },
  }
  
  const color = colors[type]
  
  return `
    <div style="background-color: ${color.bg}; border-left: 4px solid ${color.border}; padding: 16px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: ${color.text};">${content}</p>
    </div>
  `
}

export const emailStats = (stats: { label: string; value: string | number }[]) => {
  return `
    <div style="display: table; width: 100%; margin: 20px 0; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden;">
      ${stats.map((stat, index) => `
        <div style="display: table-cell; padding: 20px; text-align: center; ${index > 0 ? 'border-left: 1px solid #e5e5e5;' : ''}">
          <div style="font-size: 32px; font-weight: 700; color: #7C3AED; margin-bottom: 5px;">${stat.value}</div>
          <div style="font-size: 14px; color: #666;">${stat.label}</div>
        </div>
      `).join('')}
    </div>
  `
}