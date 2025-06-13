'use server';

import nodemailer from 'nodemailer';

type ContactFormInput = {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
};

export async function sendContactEmail({
  firstName,
  lastName,
  email,
  message,
}: ContactFormInput) {
  try {
    // Validate input
    if (!firstName || !lastName || !email || !message) {
      return { error: 'All fields are required' };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { error: 'Please enter a valid email address' };
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Email options
    const mailOptions = {
      from: `"BlockFortune Support" <${process.env.EMAIL_USERNAME}>`,
      to: process.env.EMAIL_USERNAME,
      subject: `New Contact Form Submission from ${firstName} ${lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border: 1px solid #e5e7eb; background-color: #f9fafb;"><strong>Name:</strong></td>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">${firstName} ${lastName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e5e7eb; background-color: #f9fafb;"><strong>Email:</strong></td>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e5e7eb; background-color: #f9fafb;"><strong>Message:</strong></td>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">${message.replace(/\n/g, '<br>')}</td>
            </tr>
          </table>
          <p style="margin-top: 16px;">
            <a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">Reply to ${firstName}</a>
          </p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return { success: true, message: 'Your message has been sent successfully!' };
  } catch (error) {
    console.error('Error sending contact email:', error);
    return { error: 'Failed to send message. Please try again later.' };
  }
}