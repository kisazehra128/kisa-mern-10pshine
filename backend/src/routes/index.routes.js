const express = require("express");

const router = express.Router();

const {
    welcome,
    health
} = require("../controllers/index.controller");

router.get("/", welcome);

router.get("/api/health", health);

module.exports = router;