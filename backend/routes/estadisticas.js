const express = require("express");
const router = express.Router();

const { getSellsLastThreeMonths } = require("../controllers/estadisticasController");
const { CategoriesMostSold } = require("../controllers/estadisticasController");

router.get("/sellsLastThreeMonths", getSellsLastThreeMonths);
router.get("/CategoriesMostSold", CategoriesMostSold);


module.exports = router;
