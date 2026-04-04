
const pool = require('../config/db');

exports.getSummary = async (req, res, next) => {
  try {

    const [[studentCount]] = await pool.execute(
      'SELECT COUNT(*) AS total_students FROM students WHERE is_deleted = 0'
    );

    const [[assigned]] = await pool.execute(
      'SELECT COALESCE(SUM(total_fee),0) AS total_assigned_fee FROM students WHERE is_deleted = 0'
    );

  
    const [[collected]] = await pool.execute(
      'SELECT COALESCE(SUM(amount),0) AS total_collected_fee FROM payments'
    );

    const total_assigned = Number(assigned.total_assigned_fee);
    const total_collected = Number(collected.total_collected_fee);

    const total_pending = total_assigned - total_collected;

    res.json({
      total_students: Number(studentCount.total_students),
      total_collected_fee: total_collected,
      total_paid_fee: total_collected,
      total_pending_fee: total_pending
    });

  } catch (error) {
    next(error);
  }
};