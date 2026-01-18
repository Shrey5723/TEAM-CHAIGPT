const API_BASE = 'http://localhost:3000/api';

// Helper to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Auth API
export const auth = {
    register: async (data) => {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    login: async (data) => {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    getProfile: async () => {
        const res = await fetch(`${API_BASE}/auth/profile`, {
            headers: getAuthHeaders(),
        });
        return res.json();
    },
};

// Applicant API
export const applicant = {
    createProfile: async (data) => {
        const res = await fetch(`${API_BASE}/applicant/profile`, {
            method: 'POST',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    getProfile: async () => {
        const res = await fetch(`${API_BASE}/applicant/profile`, {
            headers: getAuthHeaders(),
        });
        return res.json();
    },

    uploadResume: async (file) => {
        const formData = new FormData();
        formData.append('resume', file);
        const res = await fetch(`${API_BASE}/applicant/resume`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData,
        });
        return res.json();
    },

    uploadCertificate: async (file, issuer) => {
        const formData = new FormData();
        formData.append('certificate', file);
        if (issuer) formData.append('issuer', issuer);
        const res = await fetch(`${API_BASE}/applicant/certificates`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData,
        });
        return res.json();
    },

    getSkills: async () => {
        const res = await fetch(`${API_BASE}/applicant/skills`, {
            headers: getAuthHeaders(),
        });
        return res.json();
    },

    getCertificates: async () => {
        const res = await fetch(`${API_BASE}/applicant/certificates`, {
            headers: getAuthHeaders(),
        });
        return res.json();
    },

    // Add certificate manually (no file upload needed)
    addCertificateManual: async (data) => {
        const res = await fetch(`${API_BASE}/applicant/certificates/manual`, {
            method: 'POST',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },
};

// GitHub API
export const github = {
    // Get GitHub OAuth URL
    getAuthUrl: async () => {
        const res = await fetch(`${API_BASE}/github/auth-url`, {
            headers: getAuthHeaders(),
        });
        return res.json();
    },

    // Handle OAuth callback
    handleCallback: async (code) => {
        const res = await fetch(`${API_BASE}/github/callback`, {
            method: 'POST',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
        });
        return res.json();
    },

    // Legacy: Connect with access token
    connect: async (accessToken) => {
        const res = await fetch(`${API_BASE}/github/connect`, {
            method: 'POST',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken }),
        });
        return res.json();
    },

    getRepos: async () => {
        const res = await fetch(`${API_BASE}/github/repos`, {
            headers: getAuthHeaders(),
        });
        return res.json();
    },
};

// Corporate API
export const corporate = {
    getJobs: async () => {
        const res = await fetch(`${API_BASE}/corporate/jobs`);
        return res.json();
    },

    createJob: async (data) => {
        const res = await fetch(`${API_BASE}/corporate/jobs`, {
            method: 'POST',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    getMyJobs: async () => {
        const res = await fetch(`${API_BASE}/corporate/my-jobs`, {
            headers: getAuthHeaders(),
        });
        return res.json();
    },

    getRecommendedJobs: async () => {
        const res = await fetch(`${API_BASE}/corporate/jobs/recommended/me`, {
            headers: getAuthHeaders(),
        });
        return res.json();
    },

    getRecommendedApplicants: async (jobId) => {
        const res = await fetch(`${API_BASE}/corporate/applicants/recommended/${jobId}`, {
            headers: getAuthHeaders(),
        });
        return res.json();
    },
};

// Notifications API
export const notifications = {
    get: async () => {
        const res = await fetch(`${API_BASE}/notifications`, {
            headers: getAuthHeaders(),
        });
        return res.json();
    },

    markAsRead: async (id) => {
        const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
            method: 'PUT',
            headers: getAuthHeaders(),
        });
        return res.json();
    },

    markAllAsRead: async () => {
        const res = await fetch(`${API_BASE}/notifications/read-all`, {
            method: 'PUT',
            headers: getAuthHeaders(),
        });
        return res.json();
    },
};
