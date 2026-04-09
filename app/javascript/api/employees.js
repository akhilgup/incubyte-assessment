import axios from "axios";

const API_BASE = "/api/v1";

const csrfToken = () => {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute("content") : "";
};

const client = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  config.headers["X-CSRF-Token"] = csrfToken();
  return config;
});

export function fetchEmployees(params = {}) {
  return client.get("/employees", { params }).then((r) => r.data);
}

export function fetchEmployee(id) {
  return client.get(`/employees/${id}`).then((r) => r.data.employee);
}

export function createEmployee(data) {
  return client.post("/employees", { employee: data }).then((r) => r.data);
}

export function updateEmployee(id, data) {
  return client.patch(`/employees/${id}`, { employee: data }).then((r) => r.data);
}

export function deleteEmployee(id) {
  return client.delete(`/employees/${id}`);
}

export function fetchSalaryByCountry() {
  return client.get("/salary_insights/by_country").then((r) => r.data);
}

export function fetchSalaryByCountryAndTitle(country) {
  return client
    .get("/salary_insights/by_country_and_title", { params: { country } })
    .then((r) => r.data);
}

export function fetchSalarySummary() {
  return client.get("/salary_insights/summary").then((r) => r.data);
}
