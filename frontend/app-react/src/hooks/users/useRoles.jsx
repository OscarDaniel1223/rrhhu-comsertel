import { useEffect, useState } from "react";

const useRoles = (dataService) => {
    const [roles, setRoles] = useState([]);
    useEffect(() => {
        const fetchRoles = async () => {
            const roles = await dataService();
            setRoles(roles.data);
        };
        fetchRoles();
    }, [dataService]);
    return roles;
};

export default useRoles;