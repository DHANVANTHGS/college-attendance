const express= require('express');
const main = require('../controllers/user');
const auth = require('../middlewares/auth');
const router = express.Router();

router.post('/addUser',auth,user.addUser);

module.exports = router;
