import Home from "../components/contents/Home";
import Products from "../components/contents/Products";
import Users from "../components/contents/Users";
import V2_ContenedorEmpleado from "../components/V2_ContenedorEmpleado";
import V2_ContenedorAusencia from "../components/V2_ContenedorAusencia";
import V2_GestionAusencias from "../components/V2_GestionAusencias";
import V2_ContenedorPlanilla from "../components/V2_ContenedorPlanilla";
import V2_ContenedorPlanillaFormato from "../components/V2_ContenedorPlanillaFormato";
import V2_ContenedorCargo from "../components/V2_ContenedorCargo";
import V2_ContenedorProgramacionVacaciones from "../components/V2_ContenedorProgramacionVacaciones";
import { menuItems } from "../services/menuConfig";
import { useAuth } from "../providers/AuthContext";

export default function useRenderContent(activeItem) {
  const { user } = useAuth();
  const role = String(user.rol);

  // encontrar item seleccionado
  let selectedItem = menuItems.find(item => item.id === activeItem);

  // si no existe o no tiene permiso → buscar el primero permitido
  if (!selectedItem || !selectedItem.rol.includes(role)) {
    selectedItem = menuItems.find(item => item.rol.includes(role));
  }

  // fallback si no tiene nada permitido
  if (!selectedItem) {
    return {
      content: <h3>No tienes secciones disponibles</h3>,
      validItem: null
    };
  }

  // render dinámico
  let content = null;
  switch (selectedItem.id) {
    case "home":
      content = <Home />;
      break;
    case "products":
      content = <Products />;
      break;
    case "users":
      content = <Users />;
      break;
    case "employees":
      content = <V2_ContenedorEmpleado />;
      break;
    case "positions":
      content = <V2_ContenedorCargo />;
      break;
    case "absences":
      content = <V2_ContenedorAusencia />;
      break;
    case "absences_approval":
      content = <V2_GestionAusencias />;
      break;
    case "payroll":
    case "payroll_reports":
      content = <V2_ContenedorPlanilla />;
      break;
    case "vacation_programming":
      content = <V2_ContenedorProgramacionVacaciones />;
      break;
    case "payroll_format":
      content = <V2_ContenedorPlanillaFormato />;
      break;

    default:
      content = <h3>Sin contenido</h3>;
  }

  return { content, validItem: selectedItem.id };
}
