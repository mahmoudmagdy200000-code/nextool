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
  generateWhatsAppUrl: (phoneNumber: string, messageTemplate: string, context?: { 
    leadName?: string; 
    leadCity?: string; 
    leadRating?: string | number;
    leadReviews?: number;
    leadAddress?: string;
    businessType?: string;
  }): string => {
    const formattedPhone = WhatsAppService.formatPhoneNumber(phoneNumber);
    let finalMessage = messageTemplate;
    
    if (context) {
      if (context.leadName) finalMessage = finalMessage.replace(/\[Name\]/gi, context.leadName);
      if (context.leadCity) finalMessage = finalMessage.replace(/\[City\]/gi, context.leadCity);
      if (context.leadRating) finalMessage = finalMessage.replace(/\[Rating\]/gi, String(context.leadRating));
      if (context.leadReviews !== undefined) finalMessage = finalMessage.replace(/\[TotalReviews\]/gi, String(context.leadReviews));
      if (context.leadAddress) finalMessage = finalMessage.replace(/\[Address\]/gi, context.leadAddress);
      if (context.businessType) finalMessage = finalMessage.replace(/\[BusinessType\]/gi, context.businessType);
    }
    
    const encodedMessage = encodeURIComponent(finalMessage);
    return `whatsapp://send?phone=${formattedPhone}&text=${encodedMessage}`;
  }
};
