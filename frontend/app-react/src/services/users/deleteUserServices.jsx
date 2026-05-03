import axios from "axios";

const API_URL = "http://localhost:3001/api";

export const deleteUser = async (id_usuario) => {
    try {
        const { data: response } = await axios.post(`${API_URL}/deleteUser`, { id_usuario });
        return response;
    } catch (error) {
        console.log(error);

    }
}