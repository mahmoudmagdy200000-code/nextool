import React, { useState } from 'react';
import { MessageTemplate } from '../types';

interface TemplateManagerProps {
  templates: MessageTemplate[];
  onChangeTemplates: (templates: MessageTemplate[]) => void;
  onClose: () => void;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({ templates, onChangeTemplates, onClose }) => {
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

  const handleAdd = () => {
    setEditingTemplate({ id: Date.now().toString(), name: 'New Template', content: '' });
  };

  const handleSave = () => {
    if (!editingTemplate) return;
    
    if (!editingTemplate.name.trim() || !editingTemplate.content.trim()) {
      alert("Name and content cannot be empty.");
      return;
    }

    const existingIndex = templates.findIndex(t => t.id === editingTemplate.id);
    let newTemplates = [...templates];
    
    if (existingIndex >= 0) {
      newTemplates[existingIndex] = editingTemplate;
    } else {
      newTemplates.push(editingTemplate);
    }
    
    onChangeTemplates(newTemplates);
    setEditingTemplate(null);
  };

  const handleDelete = (id: string) => {
    onChangeTemplates(templates.filter(t => t.id !== id));
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
          {editingTemplate ? (
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
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium">Save Template</button>
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
                        <button onClick={() => setEditingTemplate(template)} className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1">Edit</button>
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
