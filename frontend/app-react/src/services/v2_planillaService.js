import v2_api from './v2_api';

/**
 * Obtiene el listado de todas las planillas registradas.
 */
export const getPlanillas = async () => {
    try {
        const response = await v2_api.get('/planillas');
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Obtiene el detalle consolidado y boletas de pago de una planilla por ID.
 */
export const getPlanillaById = async (id) => {
    try {
        const response = await v2_api.get(`/planillas/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Genera una nueva planilla masiva de sueldos para el período especificado.
 * @param {Object} data { fecha_inicio, fecha_fin, tipo_periodo, novedades }
 */
export const generarPlanilla = async (data) => {
    try {
        const response = await v2_api.post('/planillas', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Cierra una planilla marcándola como definitiva en el sistema.
 */
export const cerrarPlanilla = async (id) => {
    try {
        const response = await v2_api.put(`/planillas/${id}/cerrar`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Elimina una planilla y todas sus boletas de pago asociadas (solo si está en BORRADOR).
 */
export const deletePlanilla = async (id) => {
    try {
        const response = await v2_api.delete(`/planillas/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
