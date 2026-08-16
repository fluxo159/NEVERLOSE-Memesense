import { YouthProfile, EmploymentStatus, VerificationState, SupportProgram } from '../types';

const API_BASE = 'http://localhost:3001/api';

export const api = {
  async getYouth(): Promise<YouthProfile[]> {
    try {
      const res = await fetch(`${API_BASE}/youth`);
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (e) {
      console.warn('Backend not available, falling back to local data');
      return [];
    }
  },

  async updateStatus(id: string, status: EmploymentStatus, officer = 'Хокимият', comment?: string): Promise<YouthProfile> {
    const res = await fetch(`${API_BASE}/youth/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, officer, comment })
    });
    return res.json();
  },

  async verifyTriage(id: string, verification: VerificationState, officer = 'Хокимият', newStatus?: EmploymentStatus, comment?: string): Promise<YouthProfile> {
    const res = await fetch(`${API_BASE}/youth/${id}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verification, officer, newStatus, comment })
    });
    return res.json();
  },

  async assignProgram(id: string, program: SupportProgram, officer = 'Хокимият'): Promise<YouthProfile> {
    const res = await fetch(`${API_BASE}/youth/${id}/assign-program`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ program, officer })
    });
    return res.json();
  },

  async createYouth(data: Partial<YouthProfile>): Promise<YouthProfile> {
    const res = await fetch(`${API_BASE}/youth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async askAi(query: string, lang: 'ru' | 'uz'): Promise<{ text: string; action?: any }> {
    const res = await fetch(`${API_BASE}/ai/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, lang })
    });
    return res.json();
  }
};
