const path = require('path');
const express = require('express');

const router = express.Router();

router.get('/Schedule', (req, res) => {
  res.render('Schedule/schedule');
});

module.exports = router;