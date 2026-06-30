import axios from 'axios';
import { TOKEN_KEY } from '../auth/tokenKey.js';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the token is invalid/expired, bounce the user back to login.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const analyzeResume = (file) => {
  const form = new FormData();
  form.append('resume', file);
  return api.post('/resume/analyze', form, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const matchJD = (resumeFile, jdText) => {
  const formData = new FormData();

  formData.append('resume', resumeFile);
  formData.append('jdText', jdText);

  return api.post(
    '/jd-match',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
};

export const analyzeGithub = (username) => api.get(`/github/${username}`);

export const analyzeLinkedin = (
  profileFile,
  linkedinUrl
) => {

  const formData = new FormData();

  formData.append(
    'profile',
    profileFile
  );

  formData.append(
    'linkedinUrl',
    linkedinUrl
  );

  return api.post(
    '/linkedin/analyze',
    formData,
    {
      headers: {
        'Content-Type':
          'multipart/form-data'
      }
    }
  );
};


export const analyzeCoding = (handles) =>
  api.post(
    '/coding/analyze',
    handles
  );

export const computeOverall = (scores) => api.post('/overall', scores);


export default api;
