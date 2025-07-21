const express = require('express');
const router = express.Router();

const employeeRoutes = require('../controllers/employee.controller').router;
const courseRoutes = require('../controllers/course.controller').router;
const dashboardRoutes = require('../controllers/dashboard.controller').router;

router.use('/employee', employeeRoutes);
router.use('/course', courseRoutes);
router.use('/dashboard', dashboardRoutes);


module.exports = router;