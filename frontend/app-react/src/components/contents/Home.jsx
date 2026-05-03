import React from "react";
import Linechart from "../charts/Linechart";
import DoubleLineChart from "../charts/DoubleLineChart";
import Barchart from "../charts/Barchart";
import { ventasUltimosTresMesesService } from "../../services/stadistics/ventasUltimosTresMesesService";
import { categoriasMasVendidasService } from "../../services/stadistics/categoriasMasVendidasService";
import useRenderGraphic from "../../hooks/useRenderGraphic";
import Card from 'react-bootstrap/Card';
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

      <div
        className="
    contenedor
   
    p-6 
    rounded-xl
    max-h-screen      /* Máximo alto = alto total de la pantalla */
    overflow-y-auto   /* Scroll vertical */
  "
      >
        {
          user.rol == 1 && (
            <>


              <div className="row g-3 mt-2">

                <div className="col-12 col-sm-6 col-lg-3">
                  <SmallCard title={userRegister.title} icon={userRegister.icon} count={userRegister.count} color={userRegister.color} />
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                  <SmallCard title={clientRegister.title} icon={clientRegister.icon} count={clientRegister.count} color={clientRegister.color} />
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                  <SmallCard title={dailySales.title} icon={dailySales.icon} count={dailySales.count} color={dailySales.color} />
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                  <SmallCard title={ventasMes.title} icon={ventasMes.icon} count={ventasMes.count} color={ventasMes.color} />
                </div>

              </div>
            </>
          )
        }



        <div className="row mt-2 p-6 rounded-xl">
          <div className="col-12 col-sm-12 col-md-12 col-lg-6">

            <Card className="p-6 rounded-xl">
              <Card.Body>
                <Card.Title style={{ textAlign: "center" }}>Ventas ultimos 3 meses</Card.Title>

                <Linechart data={dataLine.data} />

              </Card.Body>
            </Card>

          </div>
          <div className="col-12 col-sm-12 col-md-12 col-lg-6">
            <Card className="p-6 rounded-xl">
              <Card.Body>
                <Card.Title style={{ textAlign: "center" }}>Top 5 categorias mas vendidas este mes</Card.Title>

                <Barchart data={dataBar.data} height={250} />

              </Card.Body>
            </Card>
          </div>

          <div className="col-12 p-6 mt-2">
            <Card className="p-6 rounded-xl">
              <Card.Body>
                <Card.Title style={{ textAlign: "center" }}>Ingresos este mes vs mes anterior</Card.Title>

                <DoubleLineChart data={dataDoubleLine.data} />


              </Card.Body>
            </Card>

          </div>

          {/*Tabla de reseñas */}

          <div className="col-12 mt-2">
            <ReviewsCard />
          </div>


        </div>

      </div >
    </>
  );

}
