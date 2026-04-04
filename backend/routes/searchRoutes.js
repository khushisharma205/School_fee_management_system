const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/student-id/:studentId', searchController.searchByStudentId);
router.get('/roll-no/:rollNo', searchController.searchByRollNo);

module.exports = router;
