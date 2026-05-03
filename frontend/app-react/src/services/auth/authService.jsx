import axios from 'axios';

export const login = async (email, password) => {

    const response = await axios.post('http://localhost:3001/api/login', {
        email,
        password
    });
    return response.data;


}

export const changePassword = async (temp_password, new_password, id) => {

    const response = await axios.post('http://localhost:3001/api/change-password', {
        temp_password,
        new_password,
        id_usuario: id
    });
    return response.data;

}
