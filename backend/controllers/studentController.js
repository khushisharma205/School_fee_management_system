const pool = require('../config/db');

exports.getStudents = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT s.*, COALESCE(SUM(p.amount), 0) AS paid_fee,
      (s.total_fee - COALESCE(SUM(p.amount), 0)) AS pending_fee,
      CASE
        WHEN COALESCE(SUM(p.amount), 0) = 0 THEN 'Unpaid'
        WHEN COALESCE(SUM(p.amount), 0) < s.total_fee THEN 'Partial'
        ELSE 'Paid'
      END AS fee_status
      FROM students s
      LEFT JOIN payments p ON p.student_ref_id = s.id
      WHERE s.is_deleted != 1
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `);

    res.json(rows);
  } catch (error) {
    next(error);
  }
};

exports.getStudentById = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM students WHERE id = ? AND is_deleted = 0 LIMIT 1',
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.addStudent = async (req, res, next) => {
  try {
    const {
      student_id,
      roll_no,
      full_name,
      class_name,
      section_name,
      parent_name,
      phone,
      address,
      total_fee
    } = req.body;

    if (!student_id || !roll_no || !full_name || !class_name || total_fee === undefined) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const [result] = await pool.execute(
      `INSERT INTO students
      (student_id, roll_no, full_name, class_name, section_name, parent_name, phone, address, total_fee)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_id, roll_no, full_name, class_name, section_name || null, parent_name || null, phone || null, address || null, total_fee]
    );

    res.status(201).json({ message: 'Student added successfully', id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Student ID or Roll No already exists' });
    }
    next(error);
  }
};

exports.updateStudent = async (req, res, next) => {
  try {
    const {
      student_id,
      roll_no,
      full_name,
      class_name,
      section_name,
      parent_name,
      phone,
      address,
      total_fee
    } = req.body;

    const [result] = await pool.execute(
      `UPDATE students
      SET student_id = ?, roll_no = ?, full_name = ?, class_name = ?, section_name = ?, parent_name = ?, phone = ?, address = ?, total_fee = ?
      WHERE id = ? AND is_deleted = 0`,
      [student_id, roll_no, full_name, class_name, section_name || null, parent_name || null, phone || null, address || null, total_fee, req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Student ID or Roll No already exists' });
    }
    next(error);
  }
};

exports.deleteStudent = async (req, res, next) => {
  try {
    const [result] = await pool.execute(
      'DELETE students WHERE id = ?',
      [req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    next(error);
  }
};
