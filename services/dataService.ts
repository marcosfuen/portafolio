
import { PortfolioData, Project, Skill, WorkExperience, ThemeType, User, AuthState, UserRole } from '../types';
import { INITIAL_DATA } from '../constants';

const API_BASE = '/api';

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(errorData.error || `Error ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
};

export const dataService = {
  checkHealth: async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      const data = await res.json();
      return data.status === 'connected';
    } catch { return false; }
  },
  login: async (username, password): Promise<AuthState> => {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const user = await handleResponse(res);
    return { isAuthenticated: true, user: user.username, role: user.role };
  },
  getData: async (): Promise<PortfolioData> => {
    try {
      const res = await fetch(`${API_BASE}/portfolio`);
      return await handleResponse(res);
    } catch { return { ...INITIAL_DATA, isOffline: true }; }
  },
  updateProfile: async (profile: Partial<PortfolioData>) => {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    return handleResponse(res);
  },
  // Proyectos
  addProject: async (project: Omit<Project, 'id'>) => {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...project, id: Date.now().toString() })
    });
    return handleResponse(res);
  },
  updateProject: async (id: string, project: Partial<Project>) => {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    });
    return handleResponse(res);
  },
  deleteProject: async (id: string) => {
    await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' });
  },
  // Skills
  addSkill: async (skill: Omit<Skill, 'id'>) => {
    const res = await fetch(`${API_BASE}/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...skill, id: Date.now().toString() })
    });
    return handleResponse(res);
  },
  deleteSkill: async (id: string) => {
    await fetch(`${API_BASE}/skills/${id}`, { method: 'DELETE' });
  },
  // Historial Laboral
  addExperience: async (exp: Omit<WorkExperience, 'id'>) => {
    const res = await fetch(`${API_BASE}/experience`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...exp, id: 'w' + Date.now().toString() })
    });
    return handleResponse(res);
  },
  updateExperience: async (id: string, exp: Partial<WorkExperience>) => {
    const res = await fetch(`${API_BASE}/experience/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exp)
    });
    return handleResponse(res);
  },
  deleteExperience: async (id: string) => {
    await fetch(`${API_BASE}/experience/${id}`, { method: 'DELETE' });
  },
  // Usuarios
  getUsers: async (): Promise<User[]> => {
    const res = await fetch(`${API_BASE}/users`);
    return handleResponse(res);
  },
  addUser: async (user: any) => {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...user, id: 'u' + Date.now() })
    });
    return handleResponse(res);
  },
  updateUser: async (id: string, user: any) => {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    return handleResponse(res);
  },
  deleteUser: async (id: string) => {
    await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
  },
  updateTheme: async (theme: ThemeType) => {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme })
    });
    return handleResponse(res);
  }
};
