require('dotenv').config();
const cors = require('cors');
const express = require('express');
const authRoutes = require('./routes/auth');
const articulosRoutes = require('./routes/articulos');
const estadisticasRoutes = require('./routes/estadisticas');
const reviewsRoutes = require('./routes/reviews');
const statsRoutes = require('./routes/stats');
const empresaRoutes = require('./routes/empresa');
const usuariosRoutes = require('./routes/usuarios');
const v2_departamentosRoutes = require('./routes/v2_departamentos');
const v2_cargosRoutes = require('./routes/v2_cargos');
const v2_empleadosRoutes = require('./routes/v2_empleados');
const v2_ausenciasIncapacidadesRoutes = require('./routes/v2_ausenciasIncapacidades');
const v2_planillasRoutes = require('./routes/v2_planillas');
const app = express();

const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api', articulosRoutes);
app.use('/api', estadisticasRoutes);
app.use('/api', reviewsRoutes);
app.use('/api', statsRoutes);
app.use('/api', empresaRoutes);
app.use('/api', usuariosRoutes);
app.use('/api', v2_departamentosRoutes);
app.use('/api', v2_cargosRoutes);
app.use('/api', v2_empleadosRoutes);
app.use('/api', v2_ausenciasIncapacidadesRoutes);
app.use('/api', v2_planillasRoutes);






app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});