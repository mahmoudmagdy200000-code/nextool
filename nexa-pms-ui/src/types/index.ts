export interface HotelLead {
  id: string;
  name: string;
  phoneNumber: string;
  rating: number;
  status: 'Pending' | 'Contacted';
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
}
