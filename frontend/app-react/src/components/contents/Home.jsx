import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useAuth } from "../../providers/AuthContext";
import { getEmpleados } from "../../services/employees/v2_empleadoService";
import { getAusenciasIncapacidades } from "../../services/employees/v2_ausenciaService";
import { getPlanillas } from "../../services/employees/v2_planillaService";

export default function Home() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmpleados: 0,
    totalEmpleadosMesLabel: "+0 este mes",
    ausenciasMes: 0,
    ausenciasMesLabel: "vs 0 mes anterior",
    proximoPagoLabel: "Sin planilla",
    proximoPagoSublabel: "No hay periodos activos",
    departamentosData: [],
    actividadesRecientes: [],
  });

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 60) {
      return diffMins <= 5 ? "Hace un momento" : `Hace ${diffMins} minutos`;
    } else if (diffHours < 24) {
      return `Hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`;
    } else if (diffHours < 48) {
      return `Ayer, ${date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      const dia = date.getDate();
      const mes = date.toLocaleDateString("es-ES", { month: "short" });
      const mesFormatted = mes.replace(".", "");
      return `${dia} ${mesFormatted.charAt(0).toUpperCase() + mesFormatted.slice(1)}`;
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Llamar a los endpoints en paralelo
        const [empRes, ausRes, planRes] = await Promise.all([
          getEmpleados(),
          getAusenciasIncapacidades(),
          getPlanillas(),
        ]);

        const empleados = empRes.data || [];
        const ausencias = ausRes.data || [];
        const planillas = planRes.data || [];

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // 1. Procesar Empleados
        const totalEmp = empleados.length;
        const empEsteMes = empleados.filter((emp) => {
          if (!emp.fecha_ingreso) return false;
          const ingFecha = new Date(emp.fecha_ingreso);
          return ingFecha.getMonth() === currentMonth && ingFecha.getFullYear() === currentYear;
        });
        const totalEmpleadosMesLabel = `+${empEsteMes.length} este mes`;

        // Agrupar por departamento para el grafico
        const deptsMap = {};
        empleados.forEach((emp) => {
          const deptName = emp.departamento || "Sin Asignar";
          deptsMap[deptName] = (deptsMap[deptName] || 0) + 1;
        });

        const colores = ["#002d72", "#005ea2", "#2491d0", "#d2e4f5", "#818cf8", "#f43f5e", "#10b981"];
        const divisor = totalEmp || 1;
        const departamentosData = Object.keys(deptsMap).map((name, index) => {
          const count = deptsMap[name];
          const val = Math.round((count / divisor) * 100);
          return {
            name,
            value: val,
            color: colores[index % colores.length],
            percentage: `${val}%`,
          };
        }).sort((a, b) => b.value - a.value);

        // 2. Procesar Ausencias
        const ausEsteMes = ausencias.filter((aus) => {
          if (!aus.fecha_inicio) return false;
          const ausFecha = new Date(aus.fecha_inicio);
          return ausFecha.getMonth() === currentMonth && ausFecha.getFullYear() === currentYear;
        });

        // Calcular mes anterior
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const ausMesAnterior = ausencias.filter((aus) => {
          if (!aus.fecha_inicio) return false;
          const ausFecha = new Date(aus.fecha_inicio);
          return ausFecha.getMonth() === prevMonth && ausFecha.getFullYear() === prevYear;
        });
        const ausenciasMesLabel = `vs ${ausMesAnterior.length} mes anterior`;

        // 3. Procesar Proxima Planilla
        let proximoPagoLabel = "Sin planilla";
        let proximoPagoSublabel = "No hay periodos activos";

        const ultimaPlanillaActiva = planillas.find((p) => p.estado === "BORRADOR" || p.estado === "ABIERTA");
        const ultimaPlanilla = ultimaPlanillaActiva || planillas[0];

        if (ultimaPlanilla) {
          const fechaFin = new Date(ultimaPlanilla.fecha_fin);
          const dia = fechaFin.getDate();
          const mes = fechaFin.toLocaleDateString("es-ES", { month: "short" });
          const mesFormatted = mes.replace(".", "");
          proximoPagoLabel = `${dia} ${mesFormatted.charAt(0).toUpperCase() + mesFormatted.slice(1)}`;

          // Calcular dias restantes
          const difMs = fechaFin.getTime() - now.getTime();
          const difDias = Math.ceil(difMs / (1000 * 60 * 60 * 24));
          if (difDias > 0) {
            proximoPagoSublabel = `Quedan ${difDias} ${difDias === 1 ? "dia" : "dias"}`;
          } else if (difDias === 0) {
            proximoPagoSublabel = "Se paga hoy";
          } else {
            proximoPagoSublabel = `Vencido hace ${Math.abs(difDias)} ${Math.abs(difDias) === 1 ? "dia" : "dias"}`;
          }
        }

        // 4. Actividades Recientes combinadas (Ingresos + Ausencias)
        const ingresosRecientes = empleados
          .filter((emp) => emp.fecha_ingreso)
          .map((emp) => {
            const date = new Date(emp.fecha_ingreso);
            return {
              id: `ing-${emp.id}`,
              date,
              tipo: "Ingreso",
              titulo: `Nueva Contratacion: ${emp.nombres} ${emp.apellidos}`,
              subtitulo: emp.departamento || "Sin Asignar",
              icon: "bi-person-plus",
              iconColor: "text-blue-600 dark:text-blue-400",
              iconBg: "bg-blue-50 dark:bg-blue-900/20",
              badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40",
            };
          });

        const ausenciasRecientes = ausencias
          .filter((aus) => aus.fecha_inicio)
          .map((aus) => {
            const date = new Date(aus.fecha_inicio);
            return {
              id: `aus-${aus.id}`,
              date,
              tipo: "Ausencia",
              titulo: `Ausencia / ${aus.tipo}: ${aus.empleado_nombres} ${aus.empleado_apellidos}`,
              subtitulo: aus.motivo || "Motivo no especificado",
              icon: "bi-emoji-frown",
              iconColor: "text-red-600 dark:text-red-400",
              iconBg: "bg-red-50 dark:bg-red-900/20",
              badgeColor: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/40",
            };
          });

        // Mezclar y ordenar por fecha descendente
        const todasActividades = [...ingresosRecientes, ...ausenciasRecientes]
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 4)
          .map((act) => ({
            ...act,
            tiempo: formatTimeAgo(act.date),
          }));

        setStats({
          totalEmpleados: totalEmp,
          totalEmpleadosMesLabel,
          ausenciasMes: ausEsteMes.length,
          ausenciasMesLabel,
          proximoPagoLabel,
          proximoPagoSublabel,
          departamentosData,
          actividadesRecientes: todasActividades,
        });

      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-h-screen overflow-y-auto transition-colors duration-200">

      {/* Saludo y Encabezado */}
      <div className="mb-8 text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Hola, {user?.name || "Administrador"}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
          Resumen del estado de recursos humanos.
        </p>
      </div>

      {/* Tarjetas de Metricas Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        {/* Tarjeta: Total Empleados */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 flex flex-col justify-between transition-colors duration-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Total Empleados
            </span>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
              <i className="bi bi-people text-lg"></i>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white font-mono">
              {stats.totalEmpleados.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              {stats.totalEmpleadosMesLabel}
            </span>
          </div>
        </div>

        {/* Tarjeta: Ausencias del Mes */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 flex flex-col justify-between transition-colors duration-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Ausencias del Mes
            </span>
            <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
              <i className="bi bi-calendar-x text-lg"></i>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white font-mono">
              {stats.ausenciasMes}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              {stats.ausenciasMesLabel}
            </span>
          </div>
        </div>

        {/* Tarjeta: Proximo Pago de Planilla */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 flex flex-col justify-between transition-colors duration-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Proximo Pago de Planilla
            </span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <i className="bi bi-cash-stack text-lg"></i>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white font-mono">
              {stats.proximoPagoLabel}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              {stats.proximoPagoSublabel}
            </span>
          </div>
        </div>

      </div>

      {/* Widgets Inferiores */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Distribucion por Departamento */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 transition-colors duration-200">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6 text-left">
            Distribucion por Departamento
          </h3>
          <div className="flex flex-col items-center">
            {stats.departamentosData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={stats.departamentosData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {stats.departamentosData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Porcentaje"]}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        color: "#fff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Leyenda del Grafico */}
                <div className="w-full flex flex-col gap-2.5 mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                  {stats.departamentosData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="text-slate-500 dark:text-slate-400">{item.name}</span>
                      </div>
                      <span className="text-slate-800 dark:text-white font-mono">
                        {item.percentage}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm font-medium text-slate-400 dark:text-slate-500 py-10">
                No hay informacion de departamentos
              </p>
            )}
          </div>
        </div>

        {/* Actividades Recientes */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 flex flex-col justify-between transition-colors duration-200">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Actividades Recientes
              </h3>
              <button className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer">
                VER TODO
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {stats.actividadesRecientes.length > 0 ? (
                stats.actividadesRecientes.map((act) => (
                  <div key={act.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">

                    {/* Icono de Actividad */}
                    <div className={`p-2.5 ${act.iconBg} ${act.iconColor} rounded-xl`}>
                      <i className={`bi ${act.icon} text-lg flex items-center justify-center`}></i>
                    </div>

                    {/* Informacion de la Actividad */}
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate font-sans">
                        {act.titulo}
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5 font-sans">
                        {act.subtitulo}
                      </p>
                    </div>

                    {/* Tiempo y Badge de Actividad */}
                    <div className="flex flex-col items-end gap-1.5 min-w-[100px]">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium font-sans">
                        {act.tiempo}
                      </span>
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border ${act.badgeColor}`}>
                        {act.tipo}
                      </span>
                    </div>

                  </div>
                ))
              ) : (
                <p className="text-sm font-medium text-slate-400 dark:text-slate-500 py-10 text-center">
                  No hay actividades recientes registradas
                </p>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
