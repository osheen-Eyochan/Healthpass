// src/services/doctorService.js
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api/doctor"; // backend API base

// Create a new consultation
export const createConsultation = async (consultationData) => {
  const response = await axios.post(`${API_BASE}/consultations/`, consultationData);
  return response.data;
};

// Fetch all consultations
export const getConsultations = async () => {
  const response = await axios.get(`${API_BASE}/consultations/`);
  return response.data;
};

// Fetch a single consultation by ID
export const getConsultationById = async (id) => {
  const response = await axios.get(`${API_BASE}/consultations/${id}/`);
  return response.data;
};