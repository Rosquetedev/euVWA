const express = require("express");
const router = express.Router();
const controller = require("../controllers/configController");

router.get("/error", controller.vulnerable);


module.exports = router;