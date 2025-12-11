// Contact form controller
import nodemailer from 'nodemailer';

// Email transporter configuration
const createTransporter = () => {
  // Using Gmail SMTP - requires app password
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'govind.d5578@gmail.com',
      pass: process.env.EMAIL_PASSWORD || '', // Use app-specific password
    },
  });
};

/**
 * Send contact form email
 * POST /api/contact/send-email
 */
export const sendContactEmail = async (req, res) => {
  try {
    const { to, from, subject, message, priority, userEmail } = req.body;

    // Validate required fields
    if (!from || !subject || !message) {
      return res.status(400).json({
        error: 'Missing required fields: from, subject, message',
      });
    }

    // Create email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
          <h2 style="margin: 0; font-size: 24px;">New Contact Form Submission</h2>
          <p style="margin: 5px 0 0 0; font-size: 14px;">Priority: <strong>${priority || 'medium'}</strong></p>
        </div>
        
        <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 14px;">
            <strong>From:</strong> ${userEmail || from}
          </p>
          
          <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 16px;">
            ${subject}
          </h3>
          
          <div style="background: #f9fafb; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
            <p style="margin: 0; color: #374151; line-height: 1.6; white-space: pre-wrap;">
              ${message}
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            This is an automated email from AppLens contact form. Please reply directly to this email to respond.
          </p>
        </div>
      </div>
    `;

    const transporter = createTransporter();

    // Send email to admin
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'govind.d5578@gmail.com',
      to: to || 'govind.d5578@gmail.com',
      replyTo: from,
      subject: subject,
      html: htmlContent,
    });

    // Optional: Send confirmation email to user
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER || 'govind.d5578@gmail.com',
        to: from,
        subject: 'We received your message - AppLens Support',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
              <h2 style="margin: 0;">Thank You for Contacting AppLens</h2>
            </div>
            
            <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="color: #374151; margin: 0 0 15px 0;">
                Hi there,
              </p>
              
              <p style="color: #374151; line-height: 1.6; margin: 0 0 15px 0;">
                We have received your message with subject <strong>"${subject}"</strong> and will get back to you as soon as possible.
              </p>
              
              <p style="color: #374151; line-height: 1.6; margin: 0 0 15px 0;">
                Priority: <strong>${priority || 'Medium'}</strong>
              </p>
              
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Best regards,<br>
                AppLens Support Team
              </p>
            </div>
          </div>
        `,
      });
    } catch (err) {
      console.error('Failed to send confirmation email:', err);
      // Don't fail the request if confirmation email fails
    }

    res.json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Contact email error:', error);
    res.status(500).json({
      error: 'Failed to send email. Please try again later.',
      details: error.message,
    });
  }
};
