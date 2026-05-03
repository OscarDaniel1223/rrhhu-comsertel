import Card from "react-bootstrap/Card";
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

        <div style={{ overflowY: "auto", maxHeight: "400px" }} className="row">
            <div className="col-12">
                <Card style={{ width: "100%" }} className="shadow-sm">
                    <Card.Body>

                        {dataUsers.length > 0 ? (
                            <UsersTables data={dataUsers} refreshUsers={refreshUsers} />
                        ) : (
                            <p>No hay usuarios</p>
                        )}
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
}