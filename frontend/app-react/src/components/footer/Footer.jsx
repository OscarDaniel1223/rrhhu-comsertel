import { getEnterprise } from "../../services/enterprise/getEmpresa";
import useEmpresa from "../../hooks/useEmpresa";

export default function Footer() {
    const enterprise = useEmpresa(getEnterprise);
    return (
        <footer id="footer" className="text-center py-3 shadow-sm bg-white text-slate-500 text-sm border-t border-slate-200 mt-auto">
            <p className="m-0">© 2026 Todos los derechos reservados. | {enterprise.nombre_empresa}</p>
        </footer>
    );
}