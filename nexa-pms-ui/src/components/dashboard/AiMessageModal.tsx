import React from 'react';
import { Sparkles, AlertCircle, Info, MessageSquare } from 'lucide-react';
import { HotelLead } from '../../types';

interface AiMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLead: HotelLead | null;
  generating: boolean;
  generatedText: string;
  setGeneratedText: (text: string) => void;
  onSendWhatsApp: () => void;
}

export const AiMessageModal: React.FC<AiMessageModalProps> = ({
  isOpen, onClose, activeLead, generating, generatedText, setGeneratedText, onSendWhatsApp
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden border border-slate-100 scale-100 animate-in zoom-in-95 duration-300">
        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-white relative z-10 shadow-sm">
          <div className="flex items-center gap-4 md:gap-5">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-200">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 leading-tight">AI Message Lab</h2>
              <p className="text-indigo-600 font-semibold text-xs tracking-widest uppercase mt-1">Customizing for {activeLead?.name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 bg-gray-50 hover:bg-slate-100 p-3 rounded-xl transition-all duration-200"
          >
            <AlertCircle className="rotate-45" size={22} />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto bg-gray-50 flex-1">
          {generating ? (
            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400 animate-pulse" size={20} />
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold text-slate-900 mb-2">Weaving some magic...</p>
                <p className="text-slate-500 font-medium">Crafting the perfect sales hook tailored to this lead</p>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-3 px-2">
                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Drafted Message Content</label>
                 <button 
                   onClick={() => {
                     navigator.clipboard.writeText(generatedText);
                   }}
                   className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 shadow-sm"
                 >
                   <Info size={12} /> Copy Text
                 </button>
              </div>
              
              <div className="relative group">
                <textarea 
                  value={generatedText}
                  onChange={(e) => setGeneratedText(e.target.value)}
                  className="w-full h-[280px] border-2 border-slate-200 bg-white rounded-2xl p-5 font-sans text-base font-medium text-slate-800 leading-relaxed shadow-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none resize-none transition-all"
                  placeholder="AI will generate your magical message here..."
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 md:p-8 bg-white border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 rounded-b-[2rem] shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] relative z-10">
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 text-slate-600 font-semibold hover:text-slate-900 bg-gray-50 hover:bg-slate-100 rounded-xl transition-all"
          >
            Discard Draft
          </button>
          <button 
            onClick={onSendWhatsApp}
            disabled={generating || !activeLead?.phoneNumber || activeLead.phoneNumber === 'Not Available' || generatedText.includes('Error:')}
            className="w-full sm:w-auto bg-emerald-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-600 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
          >
            <MessageSquare size={18} />
            Open in WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
