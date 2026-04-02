import React, { useState, useEffect } from 'react';
import { HotelLead, MessageTemplate } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { WhatsAppService } from '../services/whatsappService';
import TemplateManager from './TemplateManager';

const Dashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [leads, setLeads] = useLocalStorage<HotelLead[]>('nexa_hotel_leads', []);

  const defaultTemplateContent = `مساء الخير يا فندم، أنا محمود مطور نظام Nexa PMS لإدارة الفنادق.\nأنا بكلم حضرتك لأني شفت إن أغلب الفنادق بتعاني من مجهود إدخال بيانات النزلاء يدوي من ملفات الـ PDF، وده بيعطل الريسبشن جداً.\nالنظام عندنا فيه ميزة ذكية بتسحب الداتا دي في ثواني وتعمل Check-in فوراً بدون أي غلطة.\nلو وقت حضرتك يسمح، حابب أبعتلك فيديو قصير (دقيقة واحدة) يوضح الفكرة دي عملي؟`;
  const [templates, setTemplates] = useLocalStorage<MessageTemplate[]>('nexa_whatsapp_templates', [
    { id: '1', name: 'Standard Nexa Intro', content: defaultTemplateContent }
  ]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);

  useEffect(() => {
    if (templates.length > 0 && !templates.find(t => t.id === selectedTemplateId)) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [templates, selectedTemplateId]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/leads/search?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Failed to fetch leads from backend');

      const data: any[] = await response.json();
      
      const newLeads: HotelLead[] = data.map(item => {
        const existingStatus = leads.find(l => l.id === item.id)?.status;
        return {
          id: item.id,
          name: item.name,
          phoneNumber: item.phoneNumber,
          rating: item.rating,
          status: existingStatus ? existingStatus : 'Pending'
        };
      });

      setLeads(newLeads);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error fetching leads');
    } finally {
      setLoading(false);
    }
  };

  const handleSendWhatsApp = (leadId: string, phoneNumber: string) => {
    const template = templates.find(t => t.id === selectedTemplateId) || templates[0];
    const messageContent = template ? template.content : 'Hello';
    const url = WhatsAppService.generateWhatsAppUrl(phoneNumber, messageContent);
    window.open(url, '_blank', 'noopener,noreferrer');
    setLeads(prevLeads =>
      prevLeads.map(lead =>
        lead.id === leadId ? { ...lead, status: 'Contacted' } : lead
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Lead Generation Dashboard</h1>
            <p className="text-gray-500 mt-1">Nexa PMS WhatsApp Marketing Assistant</p>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
            <input type="text" placeholder="e.g. Hotels in Ras Sedr" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-80 shadow-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all" />
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </header>

        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex-1 flex items-center gap-3">
            <label className="font-medium text-gray-700 whitespace-nowrap">Message Template:</label>
            <select 
              value={selectedTemplateId} 
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-600 outline-none flex-1 max-w-sm"
            >
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <button 
            onClick={() => setIsTemplateManagerOpen(true)}
            className="text-blue-600 font-medium hover:text-blue-800 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            Manage Templates
          </button>
        </div>

        {error && <div className="mb-6 p-4 text-red-700 bg-red-100 rounded-lg border border-red-200">{error}</div>}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {leads.map(lead => (
            <div key={lead.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col gap-3">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-semibold text-lg text-gray-900 leading-tight">{lead.name}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap uppercase tracking-wider ${lead.status === 'Contacted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{lead.status}</span>
              </div>
              <div className="text-gray-600 text-sm flex flex-col gap-1.5 mt-1">
                <span className="flex items-center gap-2">📞 {lead.phoneNumber || 'N/A'}</span>
                <span className="flex items-center gap-2">⭐ {lead.rating > 0 ? lead.rating : 'No Rating'}</span>
              </div>
              <button onClick={() => handleSendWhatsApp(lead.id, lead.phoneNumber)} disabled={!lead.phoneNumber || lead.phoneNumber === 'Not Available'} className="mt-3 w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm">Send WhatsApp</button>
            </div>
          ))}
          {leads.length === 0 && !loading && <div className="text-center text-gray-500 py-12 bg-white rounded-xl border border-gray-200 shadow-sm">No leads found. Enter a prompt and search to get started.</div>}
        </div>
        <div className="hidden md:block overflow-x-auto rounded-xl shadow-sm border border-gray-200 bg-white">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Hotel Name</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Phone Number</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Rating</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leads.map(lead => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="py-4 px-6 text-gray-900 font-medium whitespace-break-spaces min-w-[200px]">{lead.name}</td>
                  <td className="py-4 px-6 text-gray-600">{lead.phoneNumber || 'N/A'}</td>
                  <td className="py-4 px-6 text-gray-600">⭐ {lead.rating > 0 ? lead.rating : 'N/A'}</td>
                  <td className="py-4 px-6"><span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap uppercase tracking-wider ${lead.status === 'Contacted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{lead.status}</span></td>
                  <td className="py-4 px-6 text-right"><button onClick={() => handleSendWhatsApp(lead.id, lead.phoneNumber)} disabled={!lead.phoneNumber || lead.phoneNumber === 'Not Available'} className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm">Send WhatsApp</button></td>
                </tr>
              ))}
              {leads.length === 0 && !loading && <tr><td colSpan={5} className="py-16 text-center text-gray-500">No leads found. Enter a prompt and search above to get started.</td></tr>}
            </tbody>
          </table>
        </div>
        {isTemplateManagerOpen && (
          <TemplateManager 
            templates={templates} 
            onChangeTemplates={setTemplates} 
            onClose={() => setIsTemplateManagerOpen(false)} 
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
