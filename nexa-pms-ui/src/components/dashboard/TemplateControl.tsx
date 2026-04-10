import React from 'react';
import { AlertCircle, MessageSquare, Settings as SettingsIcon } from 'lucide-react';
import { MessageTemplate } from '../../types';

interface TemplateControlProps {
  templates: MessageTemplate[];
  selectedTemplateId: string;
  setSelectedTemplateId: (id: string) => void;
  fetchingTemplates: boolean;
  onOpenManager: () => void;
}

export const TemplateControl: React.FC<TemplateControlProps> = ({
  templates, selectedTemplateId, setSelectedTemplateId, fetchingTemplates, onOpenManager
}) => {
  return (
    <div className="mb-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200">
      <div className="flex-1 flex items-center gap-4">
        <div className="flex-1 max-w-lg">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 ml-1">Current Campaign Template</label>
          {fetchingTemplates ? (
            <div className="h-[46px] bg-gray-50 animate-pulse rounded-xl w-full" />
          ) : templates.length === 0 ? (
            <div 
              onClick={onOpenManager}
              className="flex items-center gap-3 bg-orange-50 text-orange-800 px-5 py-3 rounded-xl border border-orange-200 shadow-sm cursor-pointer hover:shadow-md transition-all group"
            >
              <div className="p-1.5 bg-orange-200/50 rounded-full group-hover:scale-110 transition-transform"><AlertCircle size={18} className="text-orange-600" /></div>
              <div>
                <h4 className="text-sm font-semibold">Create your first template</h4>
                <p className="text-xs text-orange-600/80 mt-0.5">Required before sending messages</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <select 
                value={selectedTemplateId} 
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="bg-gray-50 border border-slate-200 rounded-xl pl-12 pr-10 py-3 focus:ring-2 focus:ring-blue-500 outline-none w-full font-semibold text-slate-900 hover:shadow-sm cursor-pointer appearance-none transition-all"
              >
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          )}
        </div>
      </div>
      <button 
        onClick={onOpenManager}
        className="flex items-center justify-center gap-2 text-blue-600 font-semibold px-6 py-3 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white transition-all duration-300 active:scale-95 border border-blue-100 hover:shadow-md"
      >
        <SettingsIcon size={18} />
        Template Studio
      </button>
    </div>
  );
};
