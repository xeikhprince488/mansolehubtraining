import emailjs from '@emailjs/browser';

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

// Initialize EmailJS with your public key
const initEmailJS = () => {
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  console.log('Initializing EmailJS with public key:', publicKey ? 'Present' : 'Missing');
  if (publicKey) {
    emailjs.init(publicKey);
    return true;
  }
  return false;
};

export const sendPaymentConfirmationEmail = async (data: PaymentConfirmationEmailData) => {
  try {
    console.log('Starting email send process...');
    
    // Initialize EmailJS
    const initialized = initEmailJS();
    if (!initialized) {
      throw new Error('EmailJS initialization failed - missing public key');
    }

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;

    console.log('EmailJS Config:', {
      serviceId: serviceId ? 'Present' : 'Missing',
      templateId: templateId ? 'Present' : 'Missing',
      recipientEmail: data.studentEmail
    });

    if (!serviceId || !templateId) {
      throw new Error(`EmailJS configuration missing - Service ID: ${serviceId ? 'OK' : 'MISSING'}, Template ID: ${templateId ? 'OK' : 'MISSING'}`);
    }

    // Create email template parameters
    const templateParams = {
      to_email: data.studentEmail,
      to_name: data.studentName,
      from_name: "LMS Team", // Add this
      reply_to: data.studentEmail, // Add this
      subject: `Payment Confirmation - ${data.courseName}`,
      course_name: data.courseName,
      course_price: data.coursePrice,
      request_id: data.requestId,
      current_date: new Date().toLocaleDateString(),
      student_name: data.studentName,
      phone_number: data.phoneNumber,
      father_name: data.fatherName,
      whatsapp_number: data.whatsappNumber,
      cnic_number: data.cnicNumber,
      date_of_birth: data.dateOfBirth,
      city: data.city,
      address: data.address,
      qualification: data.qualification,
      occupation: data.occupation,
      notes: data.notes || 'No additional notes provided'
    };

    console.log('Template params being sent:', JSON.stringify(templateParams, null, 2));

    // Send email using EmailJS
    const response = await emailjs.send(
      serviceId,
      templateId,
      templateParams
    );

    console.log('Email sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
};