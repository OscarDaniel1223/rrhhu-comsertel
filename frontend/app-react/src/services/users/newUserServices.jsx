import axios from "axios";

export const newUserServices = async (data) => {
    const URL = "http://localhost:3001/api";
    try {
        const response = await axios.post(URL + "/newUser", data);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}
