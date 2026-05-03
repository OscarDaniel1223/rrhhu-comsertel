import axios from "axios";

export const getUsuarioByIdServices = async (id_usuario) => {
    const URL = "http://localhost:3001/api";
    try {
        const response = await axios.get(URL + "/getUser", {

            params: { id_usuario: id_usuario }

        });
        return response.data;
    } catch (error) {
        console.log(error);
    }
}
