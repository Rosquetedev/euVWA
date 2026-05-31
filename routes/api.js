const express = require("express");
const router = express.Router();
const controller = require("../controllers/apiController");

router.get("/api/users", controller.vulnerable);


module.exports = router;