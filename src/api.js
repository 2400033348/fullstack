const BASE_URL = "https://backend-production-0cbf.up.railway.app/api";

const API_ORIGIN = BASE_URL.replace(/\/api$/, "");

export const resolveAssetUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${API_ORIGIN}${url}`;
  return `${API_ORIGIN}/${url}`;
};

const parseJsonResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

const buildProjectFormData = (projectData) => {
  const formData = new FormData();

  Object.entries(projectData).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });

  return formData;
};

export const signupUser = async (userData) => {
  const response = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return parseJsonResponse(response);
};

export const loginUser = async (userData) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return parseJsonResponse(response);
};

export const getAdmins = async () => {
  const response = await fetch(`${BASE_URL}/auth/admins`);
  return parseJsonResponse(response);
};

export const createProject = async (projectData) => {
  const response = await fetch(`${BASE_URL}/projects`, {
    method: "POST",
    body: buildProjectFormData(projectData),
  });

  return parseJsonResponse(response);
};

export const getStudentProjects = async (email) => {
  const response = await fetch(`${BASE_URL}/projects/student/${encodeURIComponent(email)}`);
  return parseJsonResponse(response);
};

export const getAdminProjects = async (email) => {
  const response = await fetch(`${BASE_URL}/projects/admin/${encodeURIComponent(email)}`);
  return parseJsonResponse(response);
};

export const updateProjectReview = async (id, reviewData) => {
  const response = await fetch(`${BASE_URL}/projects/${id}/review`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reviewData),
  });

  return parseJsonResponse(response);
};

export const updateProjectFile = async (id, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/projects/${id}/file`, {
    method: "PUT",
    body: formData,
  });

  return parseJsonResponse(response);
};

export const deleteProject = async (id) => {
  const response = await fetch(`${BASE_URL}/projects/${id}`, {
    method: "DELETE",
  });

  return parseJsonResponse(response);
};
