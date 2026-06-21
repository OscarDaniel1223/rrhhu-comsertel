import v2_api from '../v2_api';

export const getDepartamentos = async () => {
    const response = await v2_api.get('/departamentos');
    return response.data;
};
