import apiClient from './apiClient';
import { MessageTemplate } from '../types';

export const TemplateService = {
  getAll: async (): Promise<MessageTemplate[]> => {
    const response = await apiClient.get('/templates');
    return response.data;
  },

  create: async (name: string, content: string): Promise<MessageTemplate> => {
    const response = await apiClient.post('/templates', { name, content });
    return response.data;
  },

  update: async (id: string, name: string, content: string): Promise<MessageTemplate> => {
    const response = await apiClient.put(`/templates/${id}`, { name, content });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/templates/${id}`);
  },
};
