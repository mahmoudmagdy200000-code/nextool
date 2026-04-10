import React from 'react';
import { Building, Phone, Star, Sparkles, MessageSquare, ChevronRight, LogOut, CheckCircle2, Users, MapPin } from 'lucide-react';
import { HotelLead } from '../../types';

interface DesktopLeadTableProps {
  leads: HotelLead[];
  loading: boolean;
  isSaved?: boolean;
  onAiMagic: (lead: HotelLead) => void;
  onWhatsApp: (leadId: string, phoneNumber: string) => void;
  onSave?: (lead: HotelLead) => void;
  onDelete?: (id: string) => void;
}

const getStatusBadge = (status: string) => {
  if (status === 'Contacted') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm">
        <CheckCircle2 size={12} /> Contacted
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 shadow-sm">
      <Users size={12} /> New
    </span>
  );
};

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="py-4 px-4"><div className="h-5 bg-slate-200 rounded-lg w-48 mb-2"></div></td>
    <td className="py-4 px-4"><div className="h-5 bg-slate-200 rounded-lg w-32"></div></td>
    <td className="py-4 px-4"><div className="h-6 bg-slate-200 rounded-full w-16"></div></td>
    <td className="py-4 px-4"><div className="h-6 bg-slate-200 rounded-xl w-24"></div></td>
    <td className="py-4 px-4"><div className="h-10 bg-slate-200 rounded-xl w-32 ml-auto"></div></td>
  </tr>
);

export const DesktopLeadTable: React.FC<DesktopLeadTableProps> = ({ 
  leads, loading, isSaved, onAiMagic, onWhatsApp, onSave, onDelete 
}) => {
  return (
    <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
      <table className="w-full text-left border-collapse min-w-max">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="py-4 px-4 font-semibold text-slate-500 text-xs uppercase tracking-widest">Business Details</th>
            <th className="py-4 px-4 font-semibold text-slate-500 text-xs uppercase tracking-widest text-center">Contact</th>
            <th className="py-4 px-4 font-semibold text-slate-500 text-xs uppercase tracking-widest text-center">Rating</th>
            <th className="py-4 px-4 font-semibold text-slate-500 text-xs uppercase tracking-widest text-center">Status</th>
            <th className="py-4 px-4 font-semibold text-slate-500 text-xs uppercase tracking-widest text-right sticky right-0 bg-white shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.05)] z-10">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
          ) : leads.map(lead => {
            const isContacted = lead.status === 'Contacted';
            return (
            <tr key={lead.id} className={`${isContacted ? 'bg-emerald-50/30 hover:bg-emerald-50/60' : 'hover:bg-gray-50'} transition-colors group`}>
              <td className="py-4 px-4">
                <div className="flex flex-col">
                   <span className="text-base font-semibold text-slate-900">{lead.name}</span>
                   <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mt-1">
                     <Building size={14} className="text-slate-400" /> {lead.businessType ? lead.businessType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Business'}
                   </span>
                </div>
              </td>
              <td className="py-4 px-4 text-center">
                <div className="flex flex-col items-center gap-1.5">
                  <span className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-xs font-semibold text-slate-700 shadow-sm">
                    <Phone size={14} className="text-slate-400" /> {lead.phoneNumber || 'N/A'}
                  </span>
                  {isSaved && lead.address && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 max-w-[150px] truncate" title={lead.address}>
                      <MapPin size={10} className="shrink-0" />
                      <span className="truncate">{lead.address}</span>
                    </div>
                  )}
                </div>
              </td>
              <td className="py-4 px-4 text-center">
                <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-yellow-50 rounded-lg border border-yellow-200 font-semibold text-yellow-800 shadow-sm">
                  <Star fill="currentColor" className="text-yellow-500" size={12} />
                  <span className="text-sm">{lead.rating}</span>
                </div>
              </td>
              <td className="py-4 px-4 text-center">{getStatusBadge(lead.status || 'New')}</td>
              
              <td className={`py-4 px-4 text-right sticky right-0 ${isContacted ? 'bg-[#f0fdf6] group-hover:bg-[#e1f9ee]' : 'bg-white group-hover:bg-gray-50'} transition-colors shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.05)] border-l border-transparent z-10`}>
                <div className="flex justify-end gap-2 opacity-90 group-hover:opacity-100 transition-all">
                  {!isSaved && onSave && (
                    <button 
                      onClick={() => onSave(lead)} 
                      className="bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:shadow-md transition-all duration-300 p-2.5 rounded-xl shadow-sm flex items-center justify-center"
                      title="Save Lead"
                    >
                      <ChevronRight size={18} />
                    </button>
                  )}
                  {isSaved && onDelete && (
                    <button 
                      onClick={() => onDelete(lead.id)} 
                      className="bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 hover:shadow-md transition-all duration-300 p-2.5 rounded-xl shadow-sm flex items-center justify-center"
                      title="Delete"
                    >
                      <LogOut size={16} className="rotate-90" />
                    </button>
                  )}
                  <button 
                    onClick={() => onAiMagic(lead)} 
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all duration-300 active:scale-95"
                  >
                    <Sparkles size={16} /> <span className="hidden xl:inline">AI Magic</span>
                  </button>
                  <button 
                    onClick={() => onWhatsApp(lead.id, lead.phoneNumber || '')} 
                    disabled={!lead.phoneNumber || lead.phoneNumber === 'Not Available'} 
                    className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-emerald-600 shadow-sm transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:grayscale flex items-center gap-2"
                  >
                    <MessageSquare size={16} /> <span className="hidden xl:inline">{isSaved ? 'Send' : 'WhatsApp'}</span>
                  </button>
                </div>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
