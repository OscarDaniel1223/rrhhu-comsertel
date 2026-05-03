import { useEffect, useState } from "react";

const useNewUser = (dataService, data) => {
    const [newUser, setNewUser] = useState([]);
    useEffect(() => {
        const fetchNewUser = async () => {
            const newUser = await dataService(data);
            setNewUser(newUser);
        };
        fetchNewUser();
    }, [dataService]);
    return newUser;
};

export default useNewUser;