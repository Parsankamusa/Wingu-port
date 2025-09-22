import apiClient from './axiosConfig';

export const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

const registerProfessional = (data) => {
  return apiClient.post('/auth/register/professional/', data);
};
const registerRecruiter = (data) => {
  return apiClient.post('/auth/register/recruiter/', data);
};

const login = async (credentials) => {
  const response = await apiClient.post('/auth/login/', credentials);
  if (response.data.access) {
    localStorage.setItem('authToken', response.data.access);
    localStorage.setItem('winguport_user', JSON.stringify(response.data.user));
  }
  return response.data;
};
const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('winguport_user');
  if (window.location.pathname !== '/signin') {
    window.location.href = '/signin';
  }
};

const verifyEmail = (data) => {
  return apiClient.post('/auth/verify-email/', data);
};
const resendOtp = (data) => {
  return apiClient.post('/auth/resend-otp/', data);
};
const requestPasswordReset = (data) => {
  return apiClient.post('/auth/password/reset/', data);
};
const confirmPasswordReset = (data) => {
  return apiClient.post('/auth/password/reset/confirm/', data);
};
const changePassword = (data) => {
  return apiClient.post('/auth/password/change/', data);
};

const getProfile = () => {
  return apiClient.get('/users/profile/');
};

const getProfessionalProfile = () => {
    return apiClient.get('/users/profile/professional/list/');
};

const getRecruiterProfile = () => {
    return apiClient.get('/users/profile/recruiter/list/');
};

const updateProfessionalProfile = async (data) => {
  const { profile_picture, ...otherData } = data;

  const payload = {
    full_name: otherData.full_name,
    specialization: otherData.specialization,
    personal_info: otherData.personal_info || {},
    experience: otherData.experience || {},
    professional_roles: otherData.professional_roles || []
  };

    console.log("update payload", payload)

  const documentsPayload = {};
  if (otherData.documents?.cv instanceof File) {
    documentsPayload.cv = await fileToBase64(otherData.documents.cv);
  }
  if (otherData.documents?.aviation_licenses instanceof File) {
    documentsPayload.aviation_licenses = await fileToBase64(otherData.documents.aviation_licenses);
  }

  if (Object.keys(documentsPayload).length > 0) {
    payload.documents = documentsPayload;
  }

  const mainUpdateResponse = await apiClient.patch('/users/profile/professional/update/', payload);

  if (profile_picture instanceof File) {
    const formData = new FormData();
    formData.append('profile_picture', profile_picture);
    await apiClient.patch('/users/profile/professional/update/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  return mainUpdateResponse;
};

const updateRecruiterProfile = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  return apiClient.patch('/users/profile/recruiter/update/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};





// Job Application Functions
const applyForJob = async (applicationData) => {
    const { jobId, coverLetter, documents, answers } = applicationData;

    const documentsPayload = await Promise.all(
        documents.map(async (doc) => {
            const base64Data = await fileToBase64(doc.file);
            return {
                document_data: base64Data,
                name: doc.file.name,
                document_type: doc.type,
            };
        })
    );
    
    const payload = {
        job: jobId,
        cover_letter: coverLetter,
        documents: documentsPayload,
        answers: answers
    };

    return apiClient.post('/applications/', payload);
};

const getMyApplications = () => {
    return apiClient.get('/applications/');
};

const getApplicationDetails = (id) => {
    return apiClient.get(`/applications/${id}/`);
};

const getRecruiterApplications = (params) => {
    return apiClient.get('/applications/', { params });
};

const updateApplicationStatus = (applicationId, data) => {
    return apiClient.patch(`/applications/${applicationId}/`, data);
};

const withdrawApplication = (id) => {
    return apiClient.post(`/applications/${id}/withdraw/`);
};

const getApplicationStats = () => {
    return apiClient.get('/applications/stats/');
};

// Saved Searches (Jobs)
const getSavedSearches = () => {
    return apiClient.get('/saved-searches/');
};

const saveJob = (job) => {
    const payload = {
        name: job.title,
        query: `job_id:${job.id}`,
    };
    return apiClient.post('/saved-searches/', payload);
};

const unsaveJob = (savedSearchId) => {
    return apiClient.delete(`/saved-searches/${savedSearchId}/`);
};

const authService = {
  registerProfessional,
  registerRecruiter,
  login,
  logout,
  verifyEmail,
  resendOtp,
  requestPasswordReset,
  confirmPasswordReset,
  changePassword,
  getProfile,
  getProfessionalProfile,
  getRecruiterProfile,
  updateProfessionalProfile,
  updateRecruiterProfile,
  applyForJob,
  getMyApplications,
  getApplicationDetails,
  getRecruiterApplications,
  updateApplicationStatus,
  withdrawApplication,
  getApplicationStats,
  getSavedSearches,
  saveJob,
  unsaveJob,
};
export default authService;

