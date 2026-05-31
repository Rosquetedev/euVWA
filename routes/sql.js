const express = require("express");
const router = express.Router();
const controller = require("../controllers/sqlController");

router.get("/sql", controller.form);
router.post("/sql", controller.vulnerable);


module.exports = router;