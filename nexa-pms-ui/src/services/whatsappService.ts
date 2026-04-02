export const WhatsAppService = {
  formatPhoneNumber: (phone: string): string => {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('01') && cleaned.length === 11) {
      cleaned = '2' + cleaned;
    } else if (cleaned.startsWith('0') && cleaned.length > 1) {
      cleaned = '2' + cleaned;
    }
    return cleaned;
  },
  generateWhatsAppUrl: (phoneNumber: string, messageTemplate: string): string => {
    const formattedPhone = WhatsAppService.formatPhoneNumber(phoneNumber);
    const encodedMessage = encodeURIComponent(messageTemplate);
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  }
};
