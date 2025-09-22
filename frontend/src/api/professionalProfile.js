import apiClient from "./axiosConfig";

const url = "users/profile/professional";

const updateProfessionalProfile = async (profileData) => await apiClient.patch(`${url}/update/`, profileData)
const updateSingleResource = async (resourceId, resourceType, data) => {
    let body;
  let headers = {};
    const hasFile = Object.values(data).some((v) => v instanceof File);
  if (hasFile) {
    console.log("--file found--")
    body = new FormData();
    for (let key in data) {
      body.append(key, data[key]);
    }
    console.log("form data", body)
  } else {
    body = data;
    headers["Content-Type"] = "application/json";
  }

  return await apiClient.patch(
    `${url}/edit/${resourceType}/${resourceId}/`,
    body,
    { headers }
  );
}

const autoExtractCv = async(cv) => await apiClient.post(`${url}/cv/process/`, cv)
const getDocuments = async () => await apiClient.get('/users/documents/list/')
const createDocuments = async (data) => await apiClient.post('/users/documents/upload/add', data)
const deleteDocument = async (id) => await apiClient.delete(`/users/documents/delete/${id}/`)

export default {
    updateProfessionalProfile,
    updateSingleResource,
    autoExtractCv,
    getDocuments,
    createDocuments,
    deleteDocument
}