import axios from "axios";

export const categoriasMasVendidasService = async () => {
    const response = await axios.get("http://localhost:3001/api/CategoriesMostSold");
    return response;
}
