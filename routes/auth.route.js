const express = require('express');
const { LoginController, IsAdminController } = require('../controllers/auth.controller');

let router = express.Router();

// Sample route for user authentication
router.post('/login', LoginController);

router.get('/is-admin',IsAdminController);



module.exports = router;    