const express= require('express');
const main = require('../controllers/main');
const router = express.Router();

router.post('/login',main.login);
router.get('/test', (req, res) => {
  res.send('Main router is working');
});

module.exports = router;