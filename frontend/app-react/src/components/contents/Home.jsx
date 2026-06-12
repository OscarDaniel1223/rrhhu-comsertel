import React from "react";
import Linechart from "../charts/Linechart";
import DoubleLineChart from "../charts/DoubleLineChart";
import Barchart from "../charts/Barchart";
import { ventasUltimosTresMesesService } from "../../services/stadistics/ventasUltimosTresMesesService";
import { categoriasMasVendidasService } from "../../services/stadistics/categoriasMasVendidasService";
import useRenderGraphic from "../../hooks/useRenderGraphic";
import SmallCard from "../cards/SmallCard";
import { useAuth } from "../../providers/AuthContext";
import ReviewsCard from "../cards/ReviewsCard";
import Header from "../header/Header";
import { getUserRegister, getClientRegister, getVentasMes, getDailySales, getVentasMesAnterior } from "../../services/stadistics/getStats";
import useInfoStats from "../../hooks/useInfoStats";

export default function Home() {
  const dataLine = useRenderGraphic(ventasUltimosTresMesesService);
  const dataBar = useRenderGraphic(categoriasMasVendidasService);
  const dataDoubleLine = useRenderGraphic(getVentasMesAnterior);
  const userRegister = useInfoStats(getUserRegister);
  const clientRegister = useInfoStats(getClientRegister);
  const ventasMes = useInfoStats(getVentasMes);
  const dailySales = useInfoStats(getDailySales);

  const { user } = useAuth();

  return (
    <>
      <Header title="Estadísticas" subtitle="Aquí puedes ver estadísticas generales." />

      <div className="p-6 rounded-xl max-h-screen overflow-y-auto transition-colors duration-200">
        {
          user.rol == 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
              <SmallCard title={userRegister.title} icon={userRegister.icon} count={userRegister.count} color={userRegister.color} />
              <SmallCard title={clientRegister.title} icon={clientRegister.icon} count={clientRegister.count} color={clientRegister.color} />
              <SmallCard title={dailySales.title} icon={dailySales.icon} count={dailySales.count} color={dailySales.color} />
              <SmallCard title={ventasMes.title} icon={ventasMes.icon} count={ventasMes.count} color={ventasMes.color} />
            </div>
          )
        }

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ventas últimos 3 meses */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-6 transition-colors duration-200">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white text-center mb-4">Ventas últimos 3 meses</h3>
            <Linechart data={dataLine.data} />
          </div>

          {/* Top 5 categorías más vendidas */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-6 transition-colors duration-200">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white text-center mb-4">Top 5 categorías más vendidas este mes</h3>
            <Barchart data={dataBar.data} height={250} />
          </div>

          {/* Ingresos este mes vs anterior */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-6 transition-colors duration-200">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white text-center mb-4">Ingresos este mes vs mes anterior</h3>
            <DoubleLineChart data={dataDoubleLine.data} />
          </div>

          {/* Tabla de reseñas */}
          <div className="lg:col-span-2 mt-2">
            <ReviewsCard />
          </div>
        </div>
      </div >
    </>
  );
}
