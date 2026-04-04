
const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/summary', feeController.getAllFeeSummaries);
router.get('/student/:studentId', feeController.getStudentFeeSummary);
router.post('/payments', feeController.addPayment);
router.get('/payments/history', feeController.getPaymentHistory);
router.get('/payments/student/:studentId', feeController.getStudentPaymentHistory);

router.get('/receipt/:studentId', feeController.generateFeeReceipt);

module.exports = router;