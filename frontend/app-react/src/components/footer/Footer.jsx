import { getEnterprise } from "../../services/enterprise/getEmpresa";
import useEmpresa from "../../hooks/useEmpresa";


export default function Footer() {
    const enterprise = useEmpresa(getEnterprise);
    return (
        <footer id="footer" className="footer shadow-sm">
            <p>© 2026 Todos los derechos reservados. | {enterprise.nombre_empresa}</p>
        </footer>

    );

}