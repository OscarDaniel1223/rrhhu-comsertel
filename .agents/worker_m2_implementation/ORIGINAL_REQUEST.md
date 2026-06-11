## 2026-06-11T16:03:19-06:00
Eres worker_m2_implementation, un agente implementador de codigo (worker). Tu carpeta de trabajo es `/home/bladimir/Documentos/02 PROYECTOS/Proyecto RHU/rrhhu-comsertel/.agents/worker_m2_implementation`.

Tu mision es aplicar la migracion de Bootstrap a Tailwind CSS en los 5 componentes atomicos de la fase M2 en `frontend/app-react/src/components/` siguiendo la estrategia de sintesis de los exploradores.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Instrucciones detalladas de cambios:
1. Siempre responde en espanol. NO uses emojis.
2. `buttons/BtnLogout.jsx`:
   - Reemplaza el boton de Bootstrap (`btn btn-outline-primary w-100`) por estilos utilitarios de Tailwind CSS:
     - `className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md transition-colors duration-200 hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-500 dark:hover:text-white dark:focus:ring-offset-slate-900"`
   - Mantén intacta la logica de logout.

3. `header/Header.jsx`:
   - Elimina la importacion obsoleta `ThemeToggle`.
   - Modifica el marcado para usar clases de Tailwind y habilitar modo oscuro nativo:
     - Div principal: `className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200"`
     - Div de padding: `className="p-4 shadow-sm"`
     - Titulo h2: `className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1"`
     - Subtitulo p: `className="text-sm text-slate-500 dark:text-slate-400 mb-0"`

4. `cards/SmallCard.jsx`:
   - Elimina la importacion obsoleta de `Card`.
   - Crea un objeto estatico de mapeo de color (`colorMap`) dentro del archivo para mapear los colores dinámicos del backend (`primary`, `success`, `danger`, `warning`, `info`) a clases de Tailwind CSS:
     ```javascript
     const colorMap = {
         primary: 'text-blue-600 dark:text-blue-400',
         success: 'text-green-600 dark:text-green-400',
         danger: 'text-red-600 dark:text-red-400',
         warning: 'text-yellow-600 dark:text-yellow-400',
         info: 'text-cyan-600 dark:text-cyan-400',
     };
     ```
   - Utiliza este mapeo para renderizar la clase del icono, evitando la interpolacion dinamica `text-${color}`.
   - Aplica estilos de Tailwind al contenedor de la tarjeta y componentes internos:
     - Div contenedor: `className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 border-b-[3px] border-b-[#4a82fc] rounded-lg shadow-sm hover:shadow-md p-4 transition-all duration-200"`
     - Small: `className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"`
     - Div interior flex: `className="flex justify-between items-center mt-2"`
     - Contador: `className="text-2xl font-bold text-slate-900 dark:text-white"`
     - Icono: `className={`${icon} ${textColorClass} text-2xl`}`

5. `tables/ReviewsTables.jsx`:
   - Elimina la importacion obsoleta `Badge`.
   - Adapta el tema `customDark` de `react-data-table-component` para usar la paleta slate de Tailwind (slate-800, slate-900, slate-700, slate-400, slate-50).
   - Estiliza el buscador `<input>` con clases Tailwind reemplazando los estilos inline:
     - `className="px-3 py-1.5 w-[250px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"`

6. `contents/employees/Employees.jsx`:
   - Elimina las importaciones inactivas de `Select` (de react-select) y `useState` (de React).
   - Modifica el div contenedor:
     - `className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm min-h-[400px] transition-colors duration-200"`

Verificacion:
- Una vez aplicados todos los cambios, corre la compilacion local en `frontend/app-react` (`npm run build` o `npm run lint` segun aplique) para asegurar que no hay errores de linter.
- Corre la suite de pruebas E2E en la raiz del proyecto usando el comando:
  `CI=true npx -y -p @playwright/test -p playwright playwright test --config=frontend/app-react/playwright.config.js`
- Reporta el resultado detallado de las pruebas (por ejemplo, cuantas pasaron y si el codigo de salida fue 0) en tu archivo de handoff (`handoff.md`).
- Al terminar, notificame con send_message indicando la ruta absoluta del handoff.
