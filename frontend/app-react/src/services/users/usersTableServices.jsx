import axios from "axios";
const URL = "http://localhost:3001/api";

export const usersTableServices = async (params) => {
    const response = await axios.get(`${URL}/getUsuarios`, { params: params });
    return response;
};
