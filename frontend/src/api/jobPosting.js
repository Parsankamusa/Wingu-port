import apiClient from "./axiosConfig";

// Job Posting Functions
const createJobPosting = (data) => {
  return apiClient.post('/job-postings/add/', data);
};

const getActiveJobPostings = () => {
  return apiClient.get('/job-postings/active/list/');
};

const getMyJobPostings = (page = 1) => {
  return apiClient.get(`/recruiter/job-postings/list/?page=${page}`);
};

const getJobPostingById = (id) => {
  return apiClient.get(`/job-postings/${id}/`);
};

const updateJobPosting = (id, data) => {
  return apiClient.patch(`/job-postings/update/${id}/`, data);
};

const deleteJobPosting = (id) => {
  return apiClient.delete(`/job-postings/delete/${id}/`);
};

const getRecommendedJobs = async() => await apiClient.get('/jobs/matching/')

export default {
    createJobPosting,
  getActiveJobPostings,
  getMyJobPostings,
  getJobPostingById,
  updateJobPosting,
  deleteJobPosting,
  getRecommendedJobs
}