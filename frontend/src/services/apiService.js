const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || "http://localhost:3000";

async function request(path, options = {}) {
  const url = `${API_GATEWAY_URL}${path}`;
  const defaults = {
    headers: { "Content-Type": "application/json" },
  };
  const config = { ...defaults, ...options, headers: { ...defaults.headers, ...(options.headers || {}) } };
  const response = await fetch(url, config);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Request failed [${response.status}]: ${error}`);
  }
  return response.json();
}

export const apiService = {
  get: (path, options = {}) => request(path, { ...options, method: "GET" }),
  post: (path, body, options = {}) =>
    request(path, { ...options, method: "POST", body: JSON.stringify(body) }),
  put: (path, body, options = {}) =>
    request(path, { ...options, method: "PUT", body: JSON.stringify(body) }),
  delete: (path, options = {}) => request(path, { ...options, method: "DELETE" }),
};

export default apiService;
