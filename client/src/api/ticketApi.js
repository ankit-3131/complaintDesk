import axios from "axios";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default async function createTicket(ticketData) {
  try {
    const response = await axios.post(`${BACKEND_URL}/ticket/createTicket`, ticketData, {
      withCredentials: true,
    });
    return { success: true, ...response.data };
  } catch (error) {
    return { success: false, message: error?.response?.data?.message || "Failed to create ticket" };
  }
}

export const getAllTickets = async (filters = {}) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/ticket/getAllTickets`, {
    params: filters,
    withCredentials: true,
  });
  return response.data;
  } catch (error) {
    console.log("server error in loading tickets",error);
    
  }
};

export async function addNote(ticketId, noteData) {
  try {
    const res = await axios.post(`${BACKEND_URL}/ticket/ticket/${ticketId}/note`, noteData, { withCredentials: true });
    return res.data;
  } catch (err) {
    console.log('addNote error', err);
    throw err;
  }
}

export async function updateTicket(ticketId, updates) {
  try {
    const res = await axios.patch(`${BACKEND_URL}/ticket/ticket/${ticketId}`, updates, { withCredentials: true });
    return res.data;
  } catch (err) {
    console.log('updateTicket error', err);
    throw err;
  }
}

export async function resolveTicket(ticketId) {
  try {
    const res = await axios.post(`${BACKEND_URL}/ticket/ticket/${ticketId}/resolve`, {}, { withCredentials: true });
    return res.data;
  } catch (err) {
    console.log('resolveTicket error', err);
    throw err;
  }
}

export async function getTicket(ticketId) {
  try {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.get(`${BACKEND_URL}/ticket/ticket/${ticketId}`, { withCredentials: true, headers });
    return res.data;
  } catch (err) {
    console.log('getTicket error', err);
    throw err;
  }
}

export async function confirmResolution(ticketId, body) {
  try {
    const res = await axios.post(`${BACKEND_URL}/ticket/ticket/${ticketId}/confirm`, body, { withCredentials: true });
    return res.data;
  } catch (err) {
    console.log('confirmResolution error', err);
    throw err;
  }
}

export async function getAllCategories() {
  try {
    const response = await axios.get(`${BACKEND_URL}/ticket/getAllCategories`, {
    withCredentials: true,
  });
  return response.data;
  } catch (error) {
    console.log("server error in loading categories",error); 
  }}
