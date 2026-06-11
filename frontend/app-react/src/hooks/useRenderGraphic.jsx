import { useEffect, useState } from "react";

const useRenderGraphic = (dataService) => {
    const [data, setData] = useState({ data: [] });

    useEffect(() => {
        const fetchData = async () => {
            const response = await dataService();
            setData(response);
        };
        fetchData();
    }, [dataService]);

    return data;
}

export default useRenderGraphic;