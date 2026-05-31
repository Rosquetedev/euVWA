const express = require("express");
const router = express.Router();

const controller = require("../controllers/fileController");

router.get("/file", controller.form);
router.post("/file", controller.vulnerable);



module.exports = router;