import React from 'react';
import { Building, Phone, Star, Sparkles, MessageSquare, ChevronRight, LogOut, MapPin } from 'lucide-react';
import { HotelLead } from '../../types';

interface MobileLeadCardProps {
  lead: HotelLead;
  isSaved?: boolean;
  onAiMagic: (lead: HotelLead) => void;
  onWhatsApp: (leadId: string, phoneNumber: string) => void;
  onSave?: (lead: HotelLead) => void;
  onDelete?: (id: string) => void;
}

export const MobileLeadCard: React.FC<MobileLeadCardProps> = ({ lead, isSaved, onAiMagic, onWhatsApp, onSave, onDelete }) => {
  const isContacted = lead.status === 'Contacted';
  
  return (
    <div className={`${isContacted ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-slate-200'} p-5 rounded-2xl shadow-sm hover:shadow-md border transition-all flex flex-col relative overflow-hidden`}>
      <div className="flex justify-between items-start mb-3">
        <div className="pr-16">
          <h3 className="text-lg font-semibold text-slate-900 leading-tight">{lead.name}</h3>
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mt-1.5">
            <Building size={12} className="text-slate-400" /> {lead.businessType ? lead.businessType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Business'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-800 px-2.5 py-1.5 rounded-xl border border-yellow-200 font-semibold text-xs absolute top-5 right-5 shadow-sm">
          <Star size={12} fill="currentColor" className="text-yellow-500" /> {lead.rating}
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-gray-50 p-3 rounded-xl border border-slate-100 w-fit">
          <Phone size={14} className="text-slate-400" /> {lead.phoneNumber || 'N/A'}
        </div>
        {isSaved && lead.address && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 line-clamp-1 max-w-[90%]">
            <MapPin size={12} className="text-slate-400 shrink-0" /> {lead.address}
          </div>
        )}
      </div>
      
      <div className={`grid ${isSaved ? 'grid-cols-[1fr_1fr_auto]' : 'grid-cols-2'} gap-2 mt-auto`}>
        <button 
          onClick={() => onAiMagic(lead)} 
          className="flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl hover:shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all duration-300 active:scale-95"
        >
          <Sparkles size={16} /> AI Magic
        </button>
        <button 
          onClick={() => onWhatsApp(lead.id, lead.phoneNumber || '')} 
          disabled={!lead.phoneNumber || lead.phoneNumber === 'Not Available'}
          className="flex justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 active:scale-95 shadow-sm disabled:opacity-50 disabled:grayscale"
        >
          <MessageSquare size={16} /> {isSaved ? 'Send' : 'WhatsApp'}
        </button>
        
        {!isSaved && onSave && (
          <button 
            onClick={() => onSave(lead)} 
            className="col-span-2 flex justify-center items-center gap-2 bg-white text-slate-600 hover:text-slate-900 border border-slate-200 font-semibold py-2.5 rounded-xl transition-all duration-300 active:scale-95 hover:bg-gray-50 hover:shadow-sm mt-1"
          >
            <ChevronRight size={18} /> Save for later
          </button>
        )}
        
        {isSaved && onDelete && (
          <button 
            onClick={() => onDelete(lead.id)} 
            className="flex items-center justify-center bg-white text-rose-500 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 font-semibold w-[48px] rounded-xl transition-all duration-300 active:scale-95 shadow-sm"
          >
            <LogOut size={16} className="rotate-90" />
          </button>
        )}
      </div>
    </div>
  );
};
