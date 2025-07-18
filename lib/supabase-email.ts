import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface PaymentConfirmationEmailData {
  studentEmail: string;
  studentName: string;
  courseName: string;
  coursePrice: number;
  fatherName?: string;
  phoneNumber: string;
  whatsappNumber?: string;
  cnicNumber?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  qualification?: string;
  occupation?: string;
  notes?: string;
  requestId: string;
}

// Generate professional HTML email template
const generateEmailHTML = (data: PaymentConfirmationEmailData): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Course Purchase Confirmation</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .email-container {
            background-color: #ffffff;
            border-radius: 12px;
            padding: 32px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #10b981;
            padding-bottom: 24px;
            margin-bottom: 32px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            color: #10b981;
            margin-bottom: 12px;
            text-shadow: 0 2px 4px rgba(16, 185, 129, 0.1);
        }
        .confirmation-badge {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 12px 24px;
            border-radius: 30px;
            display: inline-block;
            font-weight: bold;
            margin: 24px 0;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        .course-details {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            padding: 24px;
            border-radius: 12px;
            margin: 24px 0;
            border-left: 4px solid #10b981;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            font-weight: 600;
            color: #475569;
        }
        .detail-value {
            color: #1e293b;
            font-weight: 500;
        }
        .next-steps {
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
            padding: 24px;
            border-radius: 12px;
            margin: 24px 0;
            border-left: 4px solid #3b82f6;
        }
        .footer {
            text-align: center;
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 14px;
        }
        .contact-info {
            background: linear-gradient(135deg, #fef3c7, #fde68a);
            padding: 20px;
            border-radius: 12px;
            margin: 24px 0;
            border-left: 4px solid #f59e0b;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 14px 28px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            margin: 16px 0;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            transition: all 0.3s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
        }
        @media (max-width: 600px) {
            body {
                padding: 12px;
            }
            .email-container {
                padding: 24px;
            }
            .detail-row {
                flex-direction: column;
                gap: 4px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">🎓 Learning Management System</div>
            <h1 style="color: #1e293b; margin: 0; font-size: 28px;">Course Purchase Confirmation</h1>
            <div class="confirmation-badge">✅ Payment Request Submitted</div>
        </div>

        <p style="font-size: 16px; color: #475569;">Dear <strong>${
          data.studentName
        }</strong>,</p>
        
        <p style="font-size: 16px; color: #475569; line-height: 1.6;">
            Thank you for your interest in our course! Your payment request has been successfully submitted and is now under review. 
            We're excited to have you join our learning community.
        </p>

        <div class="course-details">
            <h3 style="margin-top: 0; color: #10b981; font-size: 20px;">📚 Course Details</h3>
            <div class="detail-row">
                <span class="detail-label">Course Name:</span>
                <span class="detail-value">${data.courseName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Price:</span>
                <span class="detail-value">PKR ${data.coursePrice}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Request Date:</span>
                <span class="detail-value">${new Date().toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Reference ID:</span>
                <span class="detail-value">${data.requestId}</span>
            </div>
        </div>

        <div class="next-steps">
            <h3 style="margin-top: 0; color: #3b82f6; font-size: 18px;">🚀 What Happens Next?</h3>
            <ul style="margin: 0; padding-left: 20px; color: #475569;">
                <li style="margin-bottom: 8px;">Our team will review your payment within 2-4 hours</li>
                <li style="margin-bottom: 8px;">You'll receive an email confirmation once approved</li>
                <li style="margin-bottom: 8px;">Full course access will be granted immediately after approval</li>
                <li style="margin-bottom: 8px;">You can then access all course materials and resources</li>
            </ul>
        </div>

        <div style="text-align: center; margin: 32px 0;">
            <p style="color: #475569; margin-bottom: 16px;">Track your request status:</p>
            <a href="#" class="cta-button">Check Status</a>
        </div>

        <div class="contact-info">
            <h4 style="margin-top: 0; color: #92400e; font-size: 16px;">📞 Need Help?</h4>
            <p style="margin: 8px 0; color: #92400e;">If you have any questions or need support, please don't hesitate to contact us:</p>
            <p style="margin: 8px 0; color: #92400e;"><strong>Email:</strong> programmingworld488@gmail.com</p>
            <p style="margin: 8px 0; color: #92400e;"><strong>WhatsApp:</strong> +92 (300) 123-4567</p>
        </div>

        <p style="font-size: 16px; color: #475569;">
            Thank you for choosing our platform for your learning journey. We're here to support you every step of the way!
        </p>

        <p style="font-size: 16px; color: #475569;">
            Best regards,<br>
            <strong style="color: #1e293b;">The LMS Team</strong>
        </p>

        <div class="footer">
            <p>This email was sent to ${data.studentEmail}</p>
            <p>© 2025 Learning Management System. All rights reserved.</p>
            <p style="font-size: 12px; color: #94a3b8;">
                This is an automated message regarding your course purchase request.
            </p>
        </div>
    </div>
</body>
</html>
  `;
};

// Generate plain text version for better deliverability
const generateEmailText = (data: PaymentConfirmationEmailData): string => {
  return `
Course Purchase Confirmation

Dear ${data.studentName},

Thank you for your interest in our course! Your payment request has been successfully submitted and is now under review.

Course Details:
- Course Name: ${data.courseName}
- Price: PKR ${data.coursePrice}
- Request Date: ${new Date().toLocaleDateString()}
- Reference ID: ${data.requestId}

What Happens Next?
- Our team will review your payment within 2-4 hours
- You'll receive an email confirmation once approved
- Full course access will be granted immediately after approval
- You can then access all course materials and resources

Need Help?
Email: largifysolutions.com
WhatsApp: +92 (300) 123-4567

Thank you for choosing our platform for your learning journey!

Best regards,
The LMS Team

---
This email was sent to ${data.studentEmail}
© 2025 Learning Management System. All rights reserved.
  `;
};

// Send email directly using Resend API (no Edge Functions needed)
export const sendPaymentConfirmationEmail = async (
  data: PaymentConfirmationEmailData
) => {
  try {
    console.log("Sending email via Resend API...");

    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    // Send email directly to Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'LMS Team <onboarding@resend.dev>',
        to: [data.studentEmail],
        subject: `✅ Course Purchase Request Submitted - ${data.courseName}`,
        html: generateEmailHTML(data),
        text: generateEmailText(data),
        headers: {
          'X-Entity-Ref-ID': data.requestId,
          'X-Course-Name': data.courseName,
        },
        tags: [
          { name: 'category', value: 'course_purchase' },
          { name: 'course', value: data.courseName.toLowerCase().replace(/\s+/g, '_') }
        ]
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error('Resend API error:', emailResult);
      throw new Error(`Resend API error: ${emailResult.message || 'Unknown error'}`);
    }

    console.log('Email sent successfully via Resend:', emailResult);

    // Log email in Supabase (optional, will fail silently if table doesn't exist)
    try {
      const { error: logError } = await supabase
        .from('email_logs')
        .insert({
          recipient_email: data.studentEmail,
          subject: `✅ Course Purchase Request Submitted - ${data.courseName}`,
          email_type: 'course_purchase_confirmation',
          course_name: data.courseName,
          student_name: data.studentName,
          request_id: data.requestId,
          status: 'sent',
          provider: 'resend',
          provider_message_id: emailResult.id,
          sent_at: new Date().toISOString()
        });

      if (logError) {
        console.warn('Failed to log email (table may not exist):', logError);
      }
    } catch (logError) {
      console.warn('Email logging failed (continuing anyway):', logError);
    }

    return { 
      success: true, 
      messageId: emailResult.id,
      response: emailResult 
    };

  } catch (error) {
    console.error("Failed to send email via Resend:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Alternative: Direct email sending using Supabase with Resend integration
export const sendEmailWithResend = async (
  data: PaymentConfirmationEmailData
) => {
  try {
    console.log("Sending email via Supabase + Resend...");

    const emailPayload = {
      from: "LMS Team <noreply@yourdomain.com>",
      to: [data.studentEmail],
      subject: `✅ Course Purchase Request Submitted - ${data.courseName}`,
      html: generateEmailHTML(data),
      text: generateEmailText(data),
      headers: {
        "X-Entity-Ref-ID": data.requestId,
        "X-Course-Name": data.courseName,
      },
      tags: [
        { name: "category", value: "course_purchase" },
        {
          name: "course",
          value: data.courseName.toLowerCase().replace(/\s+/g, "_"),
        },
      ],
    };

    // Store email log in Supabase
    const { error: logError } = await supabase.from("email_logs").insert({
      recipient_email: data.studentEmail,
      subject: emailPayload.subject,
      email_type: "course_purchase_confirmation",
      course_name: data.courseName,
      student_name: data.studentName,
      request_id: data.requestId,
      status: "sent",
      sent_at: new Date().toISOString(),
    });

    if (logError) {
      console.warn("Failed to log email:", logError);
    }

    // Call Resend via Supabase Edge Function
    const { data: result, error } = await supabase.functions.invoke(
      "send-resend-email",
      {
        body: emailPayload,
      }
    );

    if (error) {
      console.error("Resend email error:", error);
      return { success: false, error: error.message };
    }

    console.log("Email sent successfully via Resend:", result);
    return { success: true, response: result };
  } catch (error) {
    console.error("Failed to send email via Resend:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
