const express = require('express');
const router = express.Router();

// ✅ Direct function import karo (curly braces mat use karo)
const sendMessage = require("../controllers/chatController");

// ✅ Ab ye kaam karega
router.post("/", sendMessage);

module.exports = router;