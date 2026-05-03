const cors = require('cors');
const express = require('express');
const authRoutes = require('./routes/auth');
const articulosRoutes = require('./routes/articulos');
const estadisticasRoutes = require('./routes/estadisticas');
const reviewsRoutes = require('./routes/reviews');
const statsRoutes = require('./routes/stats');
const empresaRoutes = require('./routes/empresa');
const usuariosRoutes = require('./routes/usuarios');
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






app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});