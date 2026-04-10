import { create } from 'zustand';
import { HotelLead } from '../types';

interface LeadsState {
  searchResults: HotelLead[];
  savedLeads: HotelLead[];
  searchLocation: string;
  searchCategory: string;
  setSearchResults: (leads: HotelLead[]) => void;
  setSavedLeads: (leads: HotelLead[]) => void;
  setSearchLocation: (location: string) => void;
  setSearchCategory: (category: string) => void;
  updateLeadStatus: (leadId: string, status: string) => void;
}

export const useLeadsStore = create<LeadsState>((set) => ({
  searchResults: [],
  savedLeads: [],
  searchLocation: '',
  searchCategory: 'hotel',
  setSearchResults: (leads) => set({ searchResults: leads }),
  setSavedLeads: (leads) => set({ savedLeads: leads }),
  setSearchLocation: (location) => set({ searchLocation: location }),
  setSearchCategory: (category) => set({ searchCategory: category }),
  updateLeadStatus: (leadId, status) => set((state) => ({
    searchResults: state.searchResults.map(lead => 
      lead.id === leadId ? { ...lead, status } : lead
    ),
    savedLeads: state.savedLeads.map(lead => 
      lead.id === leadId ? { ...lead, status } : lead
    )
  })),
}));
