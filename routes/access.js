const express = require("express");
const router = express.Router();
const controller = require("../controllers/accessController");

router.get("/admin", controller.vulnerable);


module.exports = router;