import UsersTables from "../../tables/users/UsuariosTables";
import useUsuariosFillTable from "../../../hooks/users/useUsuariosFillTable";
import { useMemo } from "react";
import { usersTableServices } from "../../../services/users/usersTableServices";

export default function UsersCard({ rol, estado, refreshUsers, refreshTrigger }) {

    const filters = useMemo(() => ({
        idrol: rol,
        estado: estado,
        refreshUsers: refreshTrigger
    }), [rol, estado, refreshTrigger]);
    const dataUsers = useUsuariosFillTable(usersTableServices, filters);

    return (
        <div className="w-full max-h-[400px] overflow-y-auto">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-6 transition-colors duration-200">
                {dataUsers.length > 0 ? (
                    <UsersTables data={dataUsers} refreshUsers={refreshUsers} />
                ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No hay usuarios</p>
                )}
            </div>
        </div>
    );
}