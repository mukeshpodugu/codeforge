import axios from 'axios';

// Create central axios instance
const api = axios.create({
  baseURL: window.location.hostname === 'localhost' ? '/api' : 'https://codeforge-backend-1eg8.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth interceptor to inject Bearer tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

// ================= API ENPOINTS IMPLEMENTATION =================

// 1. Auth requests
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  verifyEmail: (data: any) => api.post('/auth/verify-email', data),
  forgotPassword: (data: any) => api.post('/auth/forgot-password', data),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data)
};

// 2. Problems & Compiler requests
export const problemsAPI = {
  list: (category?: string, difficulty?: string) => 
    api.get('/problems', { params: { category, difficulty } }),
  get: (slug: string) => api.get(`/problems/${slug}`),
  run: (data: { problemId: string; language: string; code: string; customInput?: string }) => 
    api.post('/problems/run', data),
  submit: (data: { problemId: string; language: string; code: string }) => 
    api.post('/problems/submit', data),
  history: (problemId?: string) => 
    api.get('/problems/submissions/history', { params: { problemId } })
};

// 3. Contests requests
export const contestsAPI = {
  list: () => api.get('/contests'),
  get: (id: string) => api.get(`/contests/${id}`),
  join: (id: string) => api.post(`/contests/${id}/join`),
  leaderboard: (id: string) => api.get(`/contests/${id}/leaderboard`)
};

// 4. Discussion Forum requests
export const discussAPI = {
  list: (category?: string) => api.get('/discussions', { params: { category } }),
  get: (id: string) => api.get(`/discussions/${id}`),
  create: (data: any) => api.post('/discussions', data),
  comment: (id: string, content: string) => api.post(`/discussions/${id}/comment`, { content }),
  vote: (id: string, type: 'upvote' | 'downvote') => api.post(`/discussions/${id}/vote`, { type })
};

// 5. AI features requests
export const aiAPI = {
  analyzeResume: (data: { fileName: string; skillsText: string; experienceText?: string }) => 
    api.post('/ai/analyze-resume', data),
  chatInterview: (data: { history: any[]; currentMessage: string; type: string }) => 
    api.post('/ai/interview/chat', data),
  saveInterviewResult: (data: any) => api.post('/ai/interview/result', data),
  generateRoadmap: (data: { skillLevel: string; goals: string; weakTopics: string[] }) => 
    api.post('/ai/roadmap', data),
  interviewHistory: () => api.get('/ai/interview/history')
};

// 6. Portfolio requests
export const portfolioAPI = {
  getInfo: () => api.get('/portfolio/info'),
  submitContact: (data: { name: string; email: string; message: string }) => 
    api.post('/portfolio/contact', data)
};
