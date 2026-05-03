const express = require("express");
const router = express.Router();
const { getRegisterUsers, getRegisterClients, getVentasMes, getDailySales, getVentasMesAnterior } = require("../controllers/statsController");

router.get("/getRegisterUsers", getRegisterUsers);
router.get("/getRegisterClients", getRegisterClients);
router.get("/getVentasMes", getVentasMes);
router.get("/getDailySales", getDailySales);
router.get("/getVentasMesAnterior", getVentasMesAnterior);

module.exports = router;