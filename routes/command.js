const express = require("express");
const router = express.Router();

const controller = require("../controllers/commandController");

router.get("/cmd", controller.form);
router.post("/cmd", controller.vulnerable);


module.exports = router;