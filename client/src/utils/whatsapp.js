// WhatsApp click-to-chat utility for Burhani Tutorials

export const WHATSAPP_PHONE = '8319651437';
export const WHATSAPP_COUNTRY_CODE = '91';

export function formatWhatsAppAppointmentMessage(appointment) {
  const dateStr = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const streamLine = appointment.stream ? `\nStream: ${appointment.stream}` : '';
  const dateLine = appointment.preferredDate ? `\nPreferred Date: ${appointment.preferredDate}` : '';

  return `New Burhani Tutorials Appointment
Student Name: ${appointment.studentName}
Parent Name: ${appointment.parentName}
Class: ${appointment.classApplied}th${streamLine}
Phone: ${appointment.phone}
Branch: ${appointment.branch}${dateLine}
Appointment ID: ${appointment.appointmentId || 'Pending'}
Submitted At: ${dateStr}`;
}

export function formatWhatsAppFreeSessionMessage(request) {
  const dateStr = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return `New 2-Day Free Session Request
Student Name: ${request.studentName}
Parent Name: ${request.parentName}
Class: ${request.classApplied}th
Phone: ${request.phone}
Branch: ${request.branch}
Request ID: ${request.requestId || 'Pending'}
Submitted At: ${dateStr}`;
}

export function generateWhatsAppUrl(message, phone = WHATSAPP_PHONE) {
  const cleanNumber = `${WHATSAPP_COUNTRY_CODE}${phone.replace(/\D/g, '').slice(-10)}`;
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

export function openWhatsAppChat(message, phone = WHATSAPP_PHONE) {
  const url = generateWhatsAppUrl(message, phone);
  window.open(url, '_blank', 'noopener,noreferrer');
}
