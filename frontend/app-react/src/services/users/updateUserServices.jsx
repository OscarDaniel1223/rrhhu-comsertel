import axios from "axios";

const API_URL = "http://localhost:3001/api";

export const updateUserServices = async (userData) => {

    const { data: response } = await axios.post(`${API_URL}/updateUser`, userData);
    return response;

}