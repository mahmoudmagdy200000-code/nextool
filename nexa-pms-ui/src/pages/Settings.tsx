import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Settings as SettingsIcon, 
  ChevronLeft, 
  Save, 
  Key, 
  User, 
  MessageSquare, 
  ExternalLink,
  ShieldCheck,
  Cpu,
  Sparkles,
  Lock
} from 'lucide-react';

const Settings: React.FC = () => {
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [businessProfile, setBusinessProfile] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await apiClient.get('/user/apikey');
        setGoogleApiKey(response.data.googleApiKey || response.data.apiKey || '');
        setGeminiApiKey(response.data.geminiApiKey || '');
        setBusinessProfile(response.data.businessProfile || '');
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || 'Failed to load settings');
      } finally {
        setFetching(false);
      }
    };
    fetchApiKey();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.put('/user/apikey', { 
        googleApiKey, 
        geminiApiKey,
        businessProfile
      });
      toast.success('Settings saved successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data || err.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-semibold animate-pulse uppercase tracking-widest text-xs">Syncing Preferences...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-blue-100 flex flex-col relative">
      <Toaster position="top-right" />
      
      <div className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8 lg:p-12 pb-32">
        <header className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
               <div className="p-2.5 bg-white text-slate-900 rounded-xl shadow-sm border border-gray-100">
                 <SettingsIcon size={24} />
               </div>
               <h1 className="text-3xl font-bold tracking-tight text-slate-900 px-1">Settings</h1>
            </div>
            <p className="text-slate-500 font-semibold ml-1 mt-1 flex items-center gap-2">
              Configuration & Engine Parameters
            </p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-all bg-white px-5 py-2.5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md"
          >
           <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform text-slate-400" />
           Back to Dashboard
          </button>
        </header>

        <form id="settings-form" onSubmit={handleSave} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Identity & Pitch Card */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Identity & Pitch</h2>
                <p className="text-sm font-medium text-slate-500">Define your brand personality for AI-powered outreach.</p>
              </div>
            </div>
            
            <div>
              <label htmlFor="businessProfile" className="block text-xs font-semibold text-slate-500 mb-2 ml-1">
                Your Strategic Pitch / Company Profile
              </label>
              <textarea
                id="businessProfile"
                dir="auto"
                value={businessProfile}
                onChange={(e) => setBusinessProfile(e.target.value)}
                className="w-full bg-gray-50 border-2 border-transparent rounded-xl px-5 py-4 focus:bg-white focus:border-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-900 leading-relaxed min-h-[160px]"
                placeholder="Describe your business, USP, and what you offer..."
              />
              <div className="mt-4 flex items-center gap-3 text-sm font-medium text-blue-700 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <Sparkles size={18} className="text-blue-500 shrink-0" />
                <span>Tip: The more detailed your profile, the more personalized the AI messages will be.</span>
              </div>
            </div>
          </section>

          {/* API Configurations Card */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Key size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">API Configurations</h2>
                <p className="text-sm font-medium text-slate-500">Connect your cloud services securely.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="apiKey" className="text-xs font-semibold text-slate-900 ml-1">
                    Google Places Key
                  </label>
                  <a href="https://console.cloud.google.com/google/maps-apis/credentials" target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
                    GET KEY <ExternalLink size={14} />
                  </a>
                </div>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    id="apiKey"
                    type="password"
                    value={googleApiKey}
                    onChange={(e) => setGoogleApiKey(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-5 py-3 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-slate-900"
                    placeholder="••••••••••••••••"
                  />
                </div>
                <p className="mt-2 text-xs font-semibold tracking-wider text-slate-400 ml-1 uppercase">Required for hotel lead discovery</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="geminiApiKey" className="text-xs font-semibold text-slate-900 ml-1">
                    Google Gemini Key
                  </label>
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
                    GET KEY <ExternalLink size={14} />
                  </a>
                </div>
                <div className="relative">
                  <Cpu className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    id="geminiApiKey"
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-5 py-3 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-slate-900"
                    placeholder="••••••••••••••••"
                  />
                </div>
                <p className="mt-2 text-xs font-semibold tracking-wider text-slate-400 ml-1 uppercase">Powering AI message generation</p>
              </div>
            </div>
          </section>

          {/* Outreach Engine Card (Dark Card) */}
          <section className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between border border-slate-800">
            <div className="flex items-center gap-5 mb-5 md:mb-0 text-center md:text-left flex-col md:flex-row">
              <div className="p-3 bg-slate-800 text-blue-400 rounded-xl border border-slate-700">
                <MessageSquare size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Outreach Engine</h2>
                <p className="text-sm font-medium text-slate-400">Templates are managed directly from the Dashboard.</p>
              </div>
            </div>
            <button
               type="button"
               onClick={() => navigate('/')}
               className="bg-white text-slate-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all active:scale-95 flex items-center gap-2"
            >
              Configure Templates <ExternalLink size={16} />
            </button>
          </section>

        </form>
      </div>
      
      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-gray-200 p-4 z-50">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-500">
             <Lock size={16} />
             <p className="text-sm font-medium">End-to-End Encrypted</p>
          </div>
          <button
            form="settings-form"
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 shadow-lg shadow-blue-500/30 rounded-xl font-semibold transition-all duration-300 active:scale-95 flex flex-row items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Save Global Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
