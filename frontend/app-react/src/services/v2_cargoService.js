import v2_api from './v2_api';

export const getCargos = async () => {
    const response = await v2_api.get('/cargos');
    return response.data;
};
