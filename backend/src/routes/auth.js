// routes/auth.js
const express = require("express");
const router = express.Router();
const { loginUser } = require("../services/analyticsService");

router.post("/login", async (req, res) => {
  try {
    const result = await loginUser(req.body.email, req.body.password);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;