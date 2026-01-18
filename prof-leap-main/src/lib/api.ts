// API Service for connecting to the backend
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Generic API request handler
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data.data;
}

// Profile API
export const profileApi = {
  get: () => apiRequest<Profile>('/api/applicant/profile'),
  create: (data: ProfileInput) =>
    apiRequest<Profile>('/api/applicant/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (data: ProfileInput) =>
    apiRequest<Profile>('/api/applicant/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Resume API
export const resumeApi = {
  upload: async (file: File) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('resume', file);

    const response = await fetch(`${API_BASE}/api/applicant/resume`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Upload failed');
    return data.data;
  },
  updateCgpa: (cgpa: string) =>
    apiRequest<Resume>('/api/applicant/resume/cgpa', {
      method: 'PUT',
      body: JSON.stringify({ cgpa }),
    }),
};

// Certificates API
export const certificatesApi = {
  list: () => apiRequest<Certificate[]>('/api/applicant/certificates'),
  addManual: (data: CertificateInput) =>
    apiRequest<Certificate>('/api/applicant/certificates/manual', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  upload: async (file: File, issuer?: string) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('certificate', file);
    if (issuer) formData.append('issuer', issuer);

    const response = await fetch(`${API_BASE}/api/applicant/certificates`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Upload failed');
    return data.data;
  },
  sync: () => apiRequest<DerivedSkill[]>('/api/applicant/certificates/sync', { method: 'POST' }),
  update: (id: string, data: Partial<CertificateInput>) =>
    apiRequest<Certificate>(`/api/applicant/certificates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Skills API
export const skillsApi = {
  list: () => apiRequest<DerivedSkill[]>('/api/applicant/skills'),
};

export const testApi = {
  start: () => apiRequest<{ testId: string; questions: any[] }>('/api/applicant/test/start', { method: 'POST' }),
  submit: (testId: string, answers: { questionId: string; answer: string }[]) =>
    apiRequest<any>('/api/applicant/test/submit', {
      method: 'POST',
      body: JSON.stringify({ testId, answers }),
    }),
};

// Goal-Centric Career Advices API
export const goalAdvicesApi = {
  analyze: (goals: string[]) =>
    apiRequest<GoalAnalysisResult>('/api/applicant/goal-analysis', {
      method: 'POST',
      body: JSON.stringify({ goals }),
    }),
};

export interface GoalAnalysisResult {
  goal_analysis: Array<{ goal_designation: string; career_scope: string; scope_reason: string }>;
  skills_to_improve: Array<{ skill_name: string; current_rating: number; target_rating: number; reason: string }>;
  skills_to_learn: Array<{ skill_name: string; reason: string }>;
  learning_recommendations: Array<{ skill_name: string; free_resources: any[]; paid_resources: any[] }>;
}


// GitHub API
export const githubApi = {
  connect: (accessToken: string) =>
    apiRequest<void>('/api/github/connect', {
      method: 'POST',
      body: JSON.stringify({ accessToken }),
    }),
  oauthCallback: (code: string) =>
    apiRequest<void>('/api/github/callback', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),
  getRepos: () => apiRequest<GitHubRepo[]>('/api/github/repos'),
  getAuthUrl: () => apiRequest<{ authUrl: string }>('/api/github/auth-url'),
  disconnect: () => apiRequest<void>('/api/github/disconnect', { method: 'POST' }),
};

// Jobs API (Applicant)
export const jobsApi = {
  getAll: () => apiRequest<Job[]>('/api/corporate/jobs'),
  getRecommended: () => apiRequest<RecommendedJob[]>('/api/corporate/jobs/recommended/me'),
  getSelectedForMe: () => apiRequest<SelectedJob[]>('/api/corporate/jobs/selected-for-me'),
};

// Hirer API
export const hirerApi = {
  getMyJobs: () => apiRequest<Job[]>('/api/corporate/my-jobs'),
  createJob: (data: JobInput) =>
    apiRequest<Job>('/api/corporate/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateJob: (jobId: string, data: Partial<JobInput>) =>
    apiRequest<Job>(`/api/corporate/jobs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getRecommendedApplicants: (jobId: string) =>
    apiRequest<RecommendedApplicant[]>(`/api/corporate/applicants/recommended/${jobId}`),
  selectApplicant: (jobId: string, applicantId: string) =>
    apiRequest<any>(`/api/corporate/jobs/${jobId}/select/${applicantId}`, { method: 'POST' }),
  unselectApplicant: (jobId: string, applicantId: string) =>
    apiRequest<any>(`/api/corporate/jobs/${jobId}/select/${applicantId}`, { method: 'DELETE' }),
  getSelectionsForJob: (jobId: string) =>
    apiRequest<any[]>(`/api/corporate/jobs/${jobId}/selections`),
};

// Notifications API
export const notificationsApi = {
  list: () => apiRequest<Notification[]>('/api/notifications'),
  getUnreadCount: () => apiRequest<{ count: number }>('/api/notifications/unread/count'),
  markAsRead: (id: string) =>
    apiRequest<void>(`/api/notifications/${id}/read`, { method: 'PUT' }),
  markAllAsRead: () =>
    apiRequest<void>('/api/notifications/read-all', { method: 'PUT' }),
  delete: (id: string) =>
    apiRequest<void>(`/api/notifications/${id}`, { method: 'DELETE' }),
  clearAll: () =>
    apiRequest<void>('/api/notifications', { method: 'DELETE' }),
};

// Types
export interface Profile {
  id: string;
  userId: string;
  linkedInUrl?: string;
  courseraUrl?: string;
  bio?: string;
  resume?: Resume;
  certificates?: Certificate[];
  derivedSkills?: DerivedSkill[];
  githubRepos?: GitHubRepo[];
}

export interface ProfileInput {
  linkedInUrl?: string;
  courseraUrl?: string;
  bio?: string;
}

export interface Resume {
  id: string;
  filename: string;
  filepath: string;
  cgpa?: string;
  uploadedAt: string;
}

export interface Certificate {
  id: string;
  name: string;
  companyName: string;
  platform: string;
  date?: string;
  filename?: string;
  issuer?: string;
  uploadedAt: string;
}

export interface CertificateInput {
  name: string;
  companyName: string;
  platform: string;
  date?: string;
}

export interface DerivedSkill {
  id: string;
  name: string;
  source: string;
  confidence: number;
  addedAt: string;
  lastTestedAt?: string;
  certificateId?: string;
  certificate?: {
    name: string;
    platform: string;
  };
}

export interface GitHubRepo {
  id: string;
  repoName: string;
  repoUrl: string;
  lastUpdated: string;
  readme?: string;
  languages: string[];
}

export interface Job {
  id: string;
  title: string;
  role: string;
  description?: string;
  requiredSkills: { name: string; weight: number }[];
  jobType: string;
  location?: string;
  salary?: string;
  isActive: boolean;
}

export interface RecommendedJob extends Job {
  matchScore: number;
  matchedSkills: string[];
  hirer: {
    name: string;
    email: string;
  };
}

export interface SelectedJob extends Job {
  selectedAt: string;
  selectionStatus: 'SELECTED' | 'OFFERED' | 'ACCEPTED' | 'REJECTED';
  hirer: {
    id: string;
    name: string;
  };
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface JobInput {
  title: string;
  role: string;
  description?: string;
  requiredSkills: { name: string; weight: number }[];
  jobType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE' | 'INTERNSHIP';
  location?: string;
  salary?: string;
}

export interface RecommendedApplicant {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  matchScore: number;
  matchedSkills: string[];
  derivedSkills: ApplicantSkill[];
}

export interface ApplicantSkill {
  name: string;
  confidence: number;
  source: string;
}
