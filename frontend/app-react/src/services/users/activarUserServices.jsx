import axios from "axios";

const API_URL = "http://localhost:3001/api";

export const activarUserServices = async (id_usuario) => {
    try {
        const { data: response } = await axios.post(`${API_URL}/activarUsuario`, { id_usuario });
        return response;
    } catch (error) {
        return error;
    }
}