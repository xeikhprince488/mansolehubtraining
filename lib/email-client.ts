// Updated email client to use server-side API
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

export const sendPaymentConfirmationEmail = async (data: PaymentConfirmationEmailData) => {
  try {
    console.log('Sending email via server API...');
    
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to send email');
    }

    console.log('Email sent successfully via server:', result);
    return { success: true, response: result };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
};