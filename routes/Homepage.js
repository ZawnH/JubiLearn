const path = require('path');
const express = require('express');

const router = express.Router();

router.get('/Homepage', (req, res) => {
  res.render('Homepage/index');
});

module.exports = router;