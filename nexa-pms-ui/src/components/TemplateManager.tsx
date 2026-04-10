import React, { useState, useEffect, useCallback } from 'react';
import { MessageTemplate } from '../types';
import { TemplateService } from '../services/templateService';

interface TemplateManagerProps {
  onClose: () => void;
  onTemplatesChanged: (templates: MessageTemplate[]) => void;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({ onClose, onTemplatesChanged }) => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<{ id?: string; name: string; content: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await TemplateService.getAll();
      setTemplates(data);
      onTemplatesChanged(data);
    } catch (err) {
      console.error('Failed to fetch templates', err);
      setError('Failed to load templates.');
    } finally {
      setLoading(false);
    }
  }, [onTemplatesChanged]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleAdd = () => {
    setEditingTemplate({ name: '', content: '' });
    setError('');
  };

  const handleSave = async () => {
    if (!editingTemplate) return;

    if (!editingTemplate.name.trim() || !editingTemplate.content.trim()) {
      setError('Name and content cannot be empty.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      if (editingTemplate.id) {
        await TemplateService.update(editingTemplate.id, editingTemplate.name, editingTemplate.content);
      } else {
        await TemplateService.create(editingTemplate.name, editingTemplate.content);
      }

      setEditingTemplate(null);
      await fetchTemplates();
    } catch (err: any) {
      setError(err.response?.data || 'Failed to save template.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    try {
      setError('');
      await TemplateService.delete(id);
      await fetchTemplates();
    } catch (err) {
      setError('Failed to delete template.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Manage Message Templates</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6 font-sans">
          {error && (
            <div className="p-3 text-red-700 bg-red-50 rounded-lg border border-red-200 text-sm">{error}</div>
          )}

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading templates...</div>
          ) : editingTemplate ? (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                <input 
                  type="text" 
                  value={editingTemplate.name} 
                  onChange={(e) => setEditingTemplate({...editingTemplate, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                  placeholder="e.g. Standard Cold Intro"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message Content</label>
                <textarea 
                  value={editingTemplate.content} 
                  onChange={(e) => setEditingTemplate({...editingTemplate, content: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 h-40 resize-y focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                  placeholder="Type your message template here..."
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setEditingTemplate(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {templates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No templates found. Create one.</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {templates.map(template => (
                    <div key={template.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div>
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        <p className="text-gray-500 text-sm truncate max-w-sm md:max-w-md mt-1">{template.content}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingTemplate({ id: template.id, name: template.name, content: template.content })} className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1">Edit</button>
                        <button onClick={() => handleDelete(template.id)} className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button 
                onClick={handleAdd}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors font-medium mt-2"
              >
                + Create New Template
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateManager;
