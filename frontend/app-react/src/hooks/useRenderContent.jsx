import Home from "../components/contents/Home";
import Products from "../components/contents/Products";
import Users from "../components/contents/Users";
import Employees from "../components/contents/employees/Employees";
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
      content = <Employees />;
      break;

    default:
      content = <h3>Sin contenido</h3>;
  }

  return { content, validItem: selectedItem.id };
}
