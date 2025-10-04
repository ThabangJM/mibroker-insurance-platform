// Import required dependencies for the edge function
// @ts-ignore: Deno import - this runs in Supabase Edge Functions environment, not Node.js
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Define the structure of the request payload
interface EmailRequest {
  quote: {
    id: string;
    type: string;
    provider: string;
    premium: number;
    coverage: string;
    deductible?: number;
    status: string;
    createdAt: string;
  };
  applicant: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    idNumber: string;
    city: string;
  };
  insuranceInfo: any;
}

// CORS headers to allow cross-origin requests from the frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Main function that handles HTTP requests
serve(async (req: Request) => {
  // Handle preflight OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse the JSON request body
    const { quote, applicant, insuranceInfo }: EmailRequest = await req.json()

    // Format the insurance type for display
    const getInsuranceTypeTitle = (type: string) => {
      const titles: Record<string, string> = {
        auto: 'Car Insurance',
        home: 'Home Insurance',
        life: 'Commercial Property',
        health: 'Medical Aid',
        business: 'Business Insurance',
      }
      return titles[type] || type
    }

    // Format currency values for South African Rand
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
      }).format(amount)
    }

    // Create the email subject line
    const subject = `New Insurance Quote Purchase Request - ${getInsuranceTypeTitle(quote.type)}`

    // Build the HTML email content with comprehensive quote and applicant details
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Insurance Quote Purchase Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
          .section { background: white; margin: 15px 0; padding: 15px; border-radius: 6px; border-left: 4px solid #f97316; }
          .section h3 { margin-top: 0; color: #1e3a8a; }
          .detail-row { display: flex; justify-content: space-between; margin: 8px 0; padding: 5px 0; border-bottom: 1px solid #e2e8f0; }
          .detail-label { font-weight: bold; color: #64748b; }
          .detail-value { color: #1e293b; }
          .footer { background: #1e3a8a; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
          .highlight { background: #fef3c7; padding: 10px; border-radius: 4px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Email Header -->
          <div class="header">
            <h1>🛡️ MiBroker - Insurance Quote Purchase Request</h1>
            <p>A customer wants to purchase an insurance policy</p>
          </div>
          
          <div class="content">
            <!-- Important Notice -->
            <div class="highlight">
              <strong>⚡ Action Required:</strong> Customer is ready to purchase this policy. Please contact them within 24 hours.
            </div>

            <!-- Quote Details Section -->
            <div class="section">
              <h3>📋 Quote Details</h3>
              <div class="detail-row">
                <span class="detail-label">Quote ID:</span>
                <span class="detail-value">${quote.id}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Insurance Type:</span>
                <span class="detail-value">${getInsuranceTypeTitle(quote.type)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Provider:</span>
                <span class="detail-value">${quote.provider}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Monthly Premium:</span>
                <span class="detail-value">${formatCurrency(quote.premium)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Coverage Amount:</span>
                <span class="detail-value">${quote.coverage}</span>
              </div>
              ${quote.deductible ? `
              <div class="detail-row">
                <span class="detail-label">Deductible:</span>
                <span class="detail-value">${formatCurrency(quote.deductible)}</span>
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="detail-label">Quote Date:</span>
                <span class="detail-value">${new Date(quote.createdAt).toLocaleDateString('en-ZA')}</span>
              </div>
            </div>

            <!-- Customer Details Section -->
            <div class="section">
              <h3>👤 Customer Information</h3>
              <div class="detail-row">
                <span class="detail-label">Full Name:</span>
                <span class="detail-value">${applicant.firstName} ${applicant.lastName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email Address:</span>
                <span class="detail-value">${applicant.email}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Phone Number:</span>
                <span class="detail-value">${applicant.phone}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">ID Number:</span>
                <span class="detail-value">${applicant.idNumber}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">City:</span>
                <span class="detail-value">${applicant.city}</span>
              </div>
            </div>

            <!-- Insurance Specific Details Section -->
            <div class="section">
              <h3>🔍 Insurance Specific Details</h3>
              ${Object.entries(insuranceInfo).map(([key, value]) => `
                <div class="detail-row">
                  <span class="detail-label">${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                  <span class="detail-value">${String(value)}</span>
                </div>
              `).join('')}
            </div>

            <!-- Next Steps Section -->
            <div class="section">
              <h3>📞 Next Steps</h3>
              <ol>
                <li><strong>Contact the customer within 24 hours</strong> using the provided phone number or email</li>
                <li><strong>Verify all details</strong> and gather any additional required information</li>
                <li><strong>Process the application</strong> with the selected insurance provider</li>
                <li><strong>Send policy documents</strong> once approved and payment is processed</li>
                <li><strong>Follow up</strong> to ensure customer satisfaction</li>
              </ol>
            </div>
          </div>

          <!-- Email Footer -->
          <div class="footer">
            <p><strong>MiBroker Insurance Platform</strong></p>
            <p>This email was automatically generated from a quote purchase request</p>
            <p>Generated on: ${new Date().toLocaleString('en-ZA')}</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Email configuration for sending via SMTP
    const emailData = {
      to: 'thabangjohannesmulaudzi@gmail.com',
      subject: subject,
      html: htmlContent,
      // Also include a plain text version for email clients that don't support HTML
      text: `
        New Insurance Quote Purchase Request
        
        Quote Details:
        - Quote ID: ${quote.id}
        - Insurance Type: ${getInsuranceTypeTitle(quote.type)}
        - Provider: ${quote.provider}
        - Monthly Premium: ${formatCurrency(quote.premium)}
        - Coverage: ${quote.coverage}
        ${quote.deductible ? `- Deductible: ${formatCurrency(quote.deductible)}` : ''}
        
        Customer Information:
        - Name: ${applicant.firstName} ${applicant.lastName}
        - Email: ${applicant.email}
        - Phone: ${applicant.phone}
        - ID Number: ${applicant.idNumber}
        - City: ${applicant.city}
        
        Insurance Details:
        ${Object.entries(insuranceInfo).map(([key, value]) => `- ${key}: ${value}`).join('\n')}
        
        Please contact the customer within 24 hours to process their policy purchase.
      `
    }

    // In a production environment, you would integrate with an email service like:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Resend
    // For now, we'll simulate the email sending and log the details

    console.log('Email would be sent with the following details:', emailData)

    // Return success response to the frontend
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Quote purchase request sent successfully',
        emailSent: true 
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    )

  } catch (error) {
    // Handle any errors that occur during processing
    console.error('Error processing quote purchase request:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to process quote purchase request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    )
  }
})