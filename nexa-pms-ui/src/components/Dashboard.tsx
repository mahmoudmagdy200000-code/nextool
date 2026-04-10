import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HotelLead, MessageTemplate } from '../types';
import { WhatsAppService } from '../services/whatsappService';
import { TemplateService } from '../services/templateService';
import { useAuthStore } from '../store/authStore';
import apiClient from '../services/apiClient';
import TemplateManager from './TemplateManager';
import { useLeadsStore } from '../store/leadsStore';
import toast, { Toaster } from 'react-hot-toast';
import { Search, Settings as SettingsIcon, LogOut, AlertCircle, LayoutDashboard, Users } from 'lucide-react';

import { ProgressWidget } from './dashboard/ProgressWidget';
import { SearchForm } from './dashboard/SearchForm';
import { MobileLeadCard } from './dashboard/MobileLeadCard';
import { DesktopLeadTable } from './dashboard/DesktopLeadTable';
import { TemplateControl } from './dashboard/TemplateControl';
import { AiMessageModal } from './dashboard/AiMessageModal';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { searchResults, savedLeads, searchLocation, searchCategory, setSearchResults, setSavedLeads, setSearchLocation, setSearchCategory, updateLeadStatus } = useLeadsStore();
  const [fetchingSaved, setFetchingSaved] = useState(true);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [fetchingTemplates, setFetchingTemplates] = useState(true);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGeneratedText, setAiGeneratedText] = useState('');
  const [activeLeadForAi, setActiveLeadForAi] = useState<HotelLead | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setFetchingTemplates(true);
      const data = await TemplateService.getAll();
      setTemplates(data);
      if (data.length > 0 && !data.find(t => t.id === selectedTemplateId)) {
        setSelectedTemplateId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch templates', err);
    } finally {
      setFetchingTemplates(false);
    }
  }, [selectedTemplateId]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (templates.length > 0 && !templates.find(t => t.id === selectedTemplateId)) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [templates, selectedTemplateId]);

  const handleTemplatesChanged = useCallback((updatedTemplates: MessageTemplate[]) => {
    setTemplates(updatedTemplates);
    if (updatedTemplates.length > 0 && !updatedTemplates.find(t => t.id === selectedTemplateId)) {
      setSelectedTemplateId(updatedTemplates[0].id);
    }
  }, [selectedTemplateId]);

  const fetchSavedLeads = async () => {
    try {
      setFetchingSaved(true);
      const response = await apiClient.get('/leads');
      setSavedLeads(response.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to fetch saved leads');
    } finally {
      setFetchingSaved(false);
    }
  };

  useEffect(() => {
    fetchSavedLeads();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchLocation.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      const response = await apiClient.get(`/leads/search?location=${encodeURIComponent(searchLocation)}&businessType=${encodeURIComponent(searchCategory)}`);
      const data: any[] = response.data;
      
      const newResults: HotelLead[] = data.map(item => ({
        id: item.id,
        name: item.name,
        phoneNumber: item.phoneNumber,
        rating: item.rating,
        totalReviews: item.totalReviews,
        businessType: item.businessType,
        address: item.address,
        status: item.status || 'New'
      }));

      setSearchResults(newResults);
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data || err.message || 'Error fetching leads');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLead = async (lead: HotelLead) => {
    try {
      await apiClient.post('/leads', lead);
      setSavedLeads([lead, ...savedLeads]);
      setSearchResults(searchResults.filter(l => l.id !== lead.id));
      toast.success('Lead saved to connections');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data || err.message || 'Failed to save lead');
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      await apiClient.delete(`/leads/${id}`);
      setSavedLeads(savedLeads.filter(l => l.id !== id));
      toast.success('Lead removed');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete lead');
    }
  };

  const handleSendWhatsApp = async (leadId: string, phoneNumber: string, isSaved: boolean = false) => {
    const template = templates.find(t => t.id === selectedTemplateId) || templates[0];
    const messageContent = template ? template.content : 'Hello';
    
    const lead = searchResults.find(l => l.id === leadId) || savedLeads.find(l => l.id === leadId);

    const url = WhatsAppService.generateWhatsAppUrl(phoneNumber, messageContent, {
      leadName: lead?.name,
      leadRating: lead?.rating,
      leadReviews: lead?.totalReviews,
      leadAddress: lead?.address,
      businessType: lead?.businessType
    });
    window.location.href = url;

    if (isSaved) {
      apiClient.patch(`/leads/${leadId}/status?status=Contacted`).catch(_ => {
        toast.error('Failed to update status on server');
      });
    }
    updateLeadStatus(leadId, "Contacted");
  };

  const stats = {
    foundToday: searchResults.length,
    totalSaved: savedLeads.length,
    contacted: savedLeads.filter(l => l.status === 'Contacted').length
  };

  const handleAiMagic = async (lead: HotelLead) => {
    setActiveLeadForAi(lead);
    setIsAiModalOpen(true);
    setAiGenerating(true);
    setAiGeneratedText('');
    
    const template = templates.find(t => t.id === selectedTemplateId) || templates[0];
    const templateContent = template ? template.content : 'Hello, we provide hotel software.';

    try {
      const response = await apiClient.post('/leads/generate-ai-message', {
        leadName: lead.name,
        leadRating: lead.rating?.toString() || 'No Rating',
        leadCity: '',
        totalReviews: lead.totalReviews?.toString() || '0',
        address: lead.address || '',
        businessType: lead.businessType || 'Hotel',
        templateContent: templateContent
      });
      setAiGeneratedText(response.data.message || response.data);
    } catch (err: any) {
      let bodyData = err.response?.data;
      if (typeof bodyData === 'object' && bodyData !== null) bodyData = bodyData.message || JSON.stringify(bodyData);
      setAiGeneratedText(`Error: ${bodyData || err.message || 'Failed to generate message'}`);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleAiSendWhatsApp = () => {
    if (!activeLeadForAi || !activeLeadForAi.phoneNumber) return;
    const url = WhatsAppService.generateWhatsAppUrl(activeLeadForAi.phoneNumber, aiGeneratedText);
    window.location.href = url;
    
    apiClient.patch(`/leads/${activeLeadForAi.id}/status?status=Contacted`).catch(console.error);
    updateLeadStatus(activeLeadForAi.id, "Contacted");
    setIsAiModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-blue-100 text-slate-900">
      <Toaster position="top-center" toastOptions={{ className: 'font-semibold rounded-2xl shadow-md border border-slate-100' }} />
      <div className="max-w-7xl mx-auto w-full p-4 md:p-8">
        
        {/* PREMIUM HEADER AREA */}
        <header className="mb-10 flex flex-col xl:flex-row xl:items-end justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl text-white shadow-sm">
                <LayoutDashboard size={24} />
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">Leads Hub</h1>
            </div>
            <p className="text-slate-500 font-medium ml-14">Your intelligent outreach command center.</p>
            
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                <Users size={16} className="text-blue-500" /> @{user?.username}
              </div>
              <button 
                onClick={() => navigate('/settings')}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-xl transition-all"
              >
                <SettingsIcon size={16} /> Settings
              </button>
              <button 
                onClick={() => logout()}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl transition-all"
              >
                <LogOut size={16} /> Log out
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-5 xl:items-center">
            <ProgressWidget contacted={stats.contacted} totalSaved={stats.totalSaved} />
            <SearchForm 
              searchLocation={searchLocation}
              searchCategory={searchCategory}
              setSearchLocation={setSearchLocation}
              setSearchCategory={setSearchCategory}
              onSearch={handleSearch}
              loading={loading}
            />
          </div>
        </header>

        <TemplateControl 
          templates={templates}
          selectedTemplateId={selectedTemplateId}
          setSelectedTemplateId={setSelectedTemplateId}
          fetchingTemplates={fetchingTemplates}
          onOpenManager={() => setIsTemplateManagerOpen(true)}
        />

        {error && (
          <div className="mb-8 p-5 flex items-start gap-4 text-rose-700 bg-rose-50 rounded-2xl border border-rose-100 shadow-sm">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold">Couldn't load leads</h4>
              <p className="font-medium text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Discovered Leads Section */}
        {(loading || searchResults.length > 0) && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center justify-between px-1">
              <span className="flex items-center gap-3">
                 <div className="bg-blue-100 text-blue-600 p-2 rounded-xl"><Search size={20} /></div>
                 Discovered Leads
              </span>
              <span className="text-sm font-semibold text-slate-500 bg-white border border-slate-200 shadow-sm px-3 py-1 rounded-full">{searchResults.length} matches</span>
            </h2>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse bg-white p-5 rounded-2xl border border-slate-200 mb-4 shadow-sm">
                    <div className="h-5 bg-slate-200 rounded w-40 mb-3"></div>
                    <div className="h-8 bg-slate-100 rounded-xl w-full mb-4"></div>
                    <div className="grid grid-cols-2 gap-2"><div className="h-10 bg-slate-200 rounded-xl"></div><div className="h-10 bg-slate-200 rounded-xl"></div></div>
                  </div>
                ))
              ) : searchResults.map(lead => (
                <MobileLeadCard 
                  key={lead.id} 
                  lead={lead} 
                  onAiMagic={handleAiMagic} 
                  onWhatsApp={() => handleSendWhatsApp(lead.id, lead.phoneNumber || '', false)} 
                  onSave={handleSaveLead} 
                />
              ))}
            </div>

            {/* Desktop View */}
            <DesktopLeadTable 
              leads={searchResults} 
              loading={loading} 
              onAiMagic={handleAiMagic} 
              onWhatsApp={(id, phone) => handleSendWhatsApp(id, phone, false)} 
              onSave={handleSaveLead} 
            />
          </div>
        )}

        {/* Saved Leads Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center justify-between px-1">
             <span className="flex items-center gap-3">
               <div className="bg-emerald-100 text-emerald-600 p-2 rounded-xl"><LayoutDashboard size={20} /></div>
               Your Connections
             </span>
             <span className="text-sm font-semibold text-slate-500 bg-white border border-slate-200 shadow-sm px-3 py-1 rounded-full">{savedLeads.length} total</span>
          </h2>
          
          {fetchingSaved ? (
            <div className="border border-slate-200 bg-white rounded-2xl overflow-hidden p-6 shadow-sm">
               <div className="animate-pulse space-y-6">
                 <div className="h-16 bg-slate-100 rounded-xl w-full"></div>
                 <div className="h-16 bg-slate-100 rounded-xl w-full"></div>
                 <div className="h-16 bg-slate-100 rounded-xl w-full"></div>
               </div>
            </div>
          ) : savedLeads.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-5 bg-gray-50 rounded-full w-fit mx-auto mb-5 text-slate-400 border border-slate-100">
                <Users size={48} />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-2">No connections yet</h3>
              <p className="text-slate-500 max-w-sm mx-auto font-medium">Your saved leads will live here. Search above to start building your pipeline.</p>
            </div>
          ) : (
            <>
              {/* Mobile View Saved Leads */}
              <div className="md:hidden space-y-4 mb-4">
                {savedLeads.map(lead => (
                  <MobileLeadCard 
                    key={lead.id} 
                    lead={lead} 
                    isSaved={true}
                    onAiMagic={handleAiMagic} 
                    onWhatsApp={() => handleSendWhatsApp(lead.id, lead.phoneNumber || '', true)} 
                    onDelete={handleDeleteLead} 
                  />
                ))}
              </div>

              {/* Desktop View Saved Leads */}
              <DesktopLeadTable 
                leads={savedLeads} 
                loading={false} 
                isSaved={true}
                onAiMagic={handleAiMagic} 
                onWhatsApp={(id, phone) => handleSendWhatsApp(id, phone, true)} 
                onDelete={handleDeleteLead} 
              />
            </>
          )}
        </div>
        
        {isTemplateManagerOpen && (
          <TemplateManager 
            onTemplatesChanged={handleTemplatesChanged}
            onClose={() => setIsTemplateManagerOpen(false)} 
          />
        )}
        
        <AiMessageModal 
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          activeLead={activeLeadForAi}
          generating={aiGenerating}
          generatedText={aiGeneratedText}
          setGeneratedText={setAiGeneratedText}
          onSendWhatsApp={handleAiSendWhatsApp}
        />
      </div>
    </div>
  );
};

export default Dashboard;
