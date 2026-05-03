import axios from "axios";

const API_URL = 'http://localhost:3001/api';

export const getRoles = async () => {
    const response = await axios.get(`${API_URL}/getRoles`);
    return response;
}