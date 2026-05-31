const express = require("express");
const router = express.Router();

const controller = require("../controllers/xssController");

router.get("/reflected", controller.reflected);


router.get("/stored", controller.storedForm);
router.post("/stored", controller.stored);



module.exports = router;