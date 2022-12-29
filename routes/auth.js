const express = require('express')
const router = express.Router()
const authCtrl = require('../controller/auth')
const password = require('../middleware/password')

router.post('/signup', password, authCtrl.signup,);
router.post('/login', authCtrl.login,);
module.exports = router;