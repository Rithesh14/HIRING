import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  data: any;
}

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const emailTemplates = {
  emailVerification: (data: any) => ({
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to TechHire Analytics!</h2>
        <p>Hi ${data.name},</p>
        <p>Thank you for registering with TechHire Analytics. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.verificationUrl}" 
             style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p><a href="${data.verificationUrl}">${data.verificationUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>Best regards,<br>The TechHire Analytics Team</p>
      </div>
    `,
    text: `
      Welcome to TechHire Analytics!
      
      Hi ${data.name},
      
      Thank you for registering with TechHire Analytics. Please verify your email address by visiting:
      ${data.verificationUrl}
      
      This link will expire in 24 hours.
      
      Best regards,
      The TechHire Analytics Team
    `
  }),

  passwordReset: (data: any) => ({
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hi ${data.name},</p>
        <p>We received a request to reset your password for your TechHire Analytics account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.resetUrl}" 
             style="background-color: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p><a href="${data.resetUrl}">${data.resetUrl}</a></p>
        <p>This link will expire in 10 minutes for security reasons.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>Best regards,<br>The TechHire Analytics Team</p>
      </div>
    `,
    text: `
      Password Reset Request
      
      Hi ${data.name},
      
      We received a request to reset your password for your TechHire Analytics account.
      
      Please visit the following link to reset your password:
      ${data.resetUrl}
      
      This link will expire in 10 minutes for security reasons.
      
      If you didn't request this password reset, please ignore this email.
      
      Best regards,
      The TechHire Analytics Team
    `
  }),

  assessmentInvitation: (data: any) => ({
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Assessment Invitation</h2>
        <p>Hi ${data.candidateName},</p>
        <p>You have been invited to take an assessment: <strong>${data.assessmentTitle}</strong></p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>Duration: ${data.duration} minutes</li>
          <li>Type: ${data.type}</li>
          <li>Deadline: ${data.deadline}</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.assessmentUrl}" 
             style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Start Assessment
          </a>
        </div>
        <p>Good luck!</p>
        <p>Best regards,<br>${data.recruiterName}<br>TechHire Analytics</p>
      </div>
    `,
    text: `
      Assessment Invitation
      
      Hi ${data.candidateName},
      
      You have been invited to take an assessment: ${data.assessmentTitle}
      
      Details:
      - Duration: ${data.duration} minutes
      - Type: ${data.type}
      - Deadline: ${data.deadline}
      
      Start the assessment at: ${data.assessmentUrl}
      
      Good luck!
      
      Best regards,
      ${data.recruiterName}
      TechHire Analytics
    `
  })
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const template = emailTemplates[options.template as keyof typeof emailTemplates];
    if (!template) {
      throw new Error(`Email template '${options.template}' not found`);
    }

    const { html, text } = template(options.data);

    const mailOptions = {
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      html,
      text
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${options.to}`, { messageId: result.messageId });
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw error;
  }
};

export const verifyEmailConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    logger.info('Email service connection verified');
    return true;
  } catch (error) {
    logger.error('Email service connection failed:', error);
    return false;
  }
};