import axios from "axios";

export const reviewsTableServices = async () => {
    return await axios.get("http://localhost:3001/api/getReviews");
};
