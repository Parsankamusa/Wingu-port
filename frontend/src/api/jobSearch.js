import apiClient from "./axiosConfig";

// Job Search Functions
const searchJobs = (params) => {
  return apiClient.get("/jobs/search/", { params });
};

const getJobDetails = (id) => {
  return apiClient.get(`/jobs/${id}/`);
};

const getSearchSuggestions = (params) => {
  return apiClient.get("/jobs/suggestions/", { params });
};

export default {
  searchJobs,
  getJobDetails,
  getSearchSuggestions,
};
