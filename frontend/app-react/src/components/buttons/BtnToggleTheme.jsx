import { useContext } from "react";
import { ThemeContext } from "../../providers/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg border border-gray-400 dark:border-gray-600
                 bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
    >
      {theme === "light" ? "🌙 Oscuro" : "☀️ Claro"}
    </button>
  );
}