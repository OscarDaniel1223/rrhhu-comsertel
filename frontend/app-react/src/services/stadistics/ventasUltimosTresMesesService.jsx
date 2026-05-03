import axios from "axios";

export const ventasUltimosTresMesesService = async () => {
    const response = await axios.get("http://localhost:3001/api/sellsLastThreeMonths");
    return response;
}