const pool = require('../config/db');

async function getStudentWithFee(whereClause, value) {
  const [rows] = await pool.execute(`
    SELECT
      s.id,
      s.student_id,
      s.roll_no,
      s.full_name,
      s.class_name,
      s.section_name,
      s.parent_name,
      s.phone,
      s.address,
      s.total_fee,
      COALESCE(SUM(p.amount), 0) AS paid_fee,
      (s.total_fee - COALESCE(SUM(p.amount), 0)) AS pending_fee,
      CASE
        WHEN COALESCE(SUM(p.amount), 0) = 0 THEN 'Unpaid'
        WHEN COALESCE(SUM(p.amount), 0) < s.total_fee THEN 'Partial'
        ELSE 'Paid'
      END AS fee_status
    FROM students s
    LEFT JOIN payments p ON p.student_ref_id = s.id
    WHERE ${whereClause} AND s.is_deleted = 0
    GROUP BY s.id
    LIMIT 1
  `, [value]);

  return rows[0] || null;
}

exports.searchByStudentId = async (req, res, next) => {
  try {
    const student = await getStudentWithFee('s.student_id = ?', req.params.studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    next(error);
  }
};

exports.searchByRollNo = async (req, res, next) => {
  try {
    const student = await getStudentWithFee('s.roll_no = ?', req.params.rollNo);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    next(error);
  }
};
