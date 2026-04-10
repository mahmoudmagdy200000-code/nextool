export interface HotelLead {
  id: string;
  placeId?: string;
  name: string;
  phoneNumber: string;
  rating: number;
  totalReviews?: number;
  businessType?: string;
  address?: string;
  status: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
}
