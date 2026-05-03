import axios from "axios";

const API_URL = 'http://localhost:3001/api';

export const getEnterprise = async () => {
    const response = await axios.get(`${API_URL}/getEmpresa`);
    return response;
}