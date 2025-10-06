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
