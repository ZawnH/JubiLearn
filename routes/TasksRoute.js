const path = require('path');
const express = require('express');

const router = express.Router();

router.get('/Task', (req, res) => {
  res.render('Tasks/task');
});

module.exports = router;