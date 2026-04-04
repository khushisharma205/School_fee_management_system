
const pool = require('../config/db');
const PDFDocument = require('pdfkit');

exports.getAllFeeSummaries = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        s.id,
        s.student_id,
        s.roll_no,
        s.full_name,
        s.class_name,
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
WHERE s.is_deleted = 0
GROUP BY s.id
ORDER BY s.id ASC
    `);

    res.json(rows);
  } catch (error) {
    next(error);
  }
};

exports.getStudentFeeSummary = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        s.id,
        s.student_id,
        s.roll_no,
        s.full_name,
        s.class_name,
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
      WHERE s.id = ? AND s.is_deleted = 0
      GROUP BY s.id
    `, [req.params.studentId]);

    if (!rows.length) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.addPayment = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { student_ref_id, amount, payment_method, reference_no, remarks } = req.body;

    if (!student_ref_id || !amount) {
      connection.release();
      return res.status(400).json({ message: 'Student and amount are required' });
    }

    await connection.beginTransaction();

    const [studentRows] = await connection.execute(
      'SELECT id, total_fee FROM students WHERE id = ? AND is_deleted = 0 LIMIT 1',
      [student_ref_id]
    );

    if (!studentRows.length) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ message: 'Student not found' });
    }

    await connection.execute(
      `INSERT INTO payments
      (student_ref_id, amount, payment_method, reference_no, remarks, created_by)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [student_ref_id, amount, payment_method || 'cash', reference_no || null, remarks || null, req.user.id]
    );

    await connection.commit();
    connection.release();
    res.status(201).json({ message: 'Payment added successfully' });
  } catch (error) {
    await connection.rollback();
    connection.release();
    next(error);
  }
};

exports.getPaymentHistory = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        p.id,
        p.student_ref_id,
        s.student_id,
        s.roll_no,
        s.full_name,
        p.amount,
        p.payment_method,
        p.reference_no,
        p.remarks,
        p.payment_date
      FROM payments p
      INNER JOIN students s ON s.id = p.student_ref_id
      WHERE s.is_deleted = 0
      ORDER BY p.payment_date DESC
    `);

    res.json(rows);
  } catch (error) {
    next(error);
  }
};

exports.getStudentPaymentHistory = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        p.id,
        p.student_ref_id,
        p.amount,
        p.payment_method,
        p.reference_no,
        p.remarks,
        p.payment_date
      FROM payments p
      WHERE p.student_ref_id = ?
      ORDER BY p.payment_date DESC
    `, [req.params.studentId]);

    res.json(rows);
  } catch (error) {
    next(error);
  }
};


exports.generateFeeReceipt = async (req, res, next) => {
  try {
    const { studentId } = req.params;

   
    const [studentRows] = await pool.execute(`
      SELECT
        s.id,
        s.student_id,
        s.roll_no,
        s.full_name,
        s.class_name,
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
      WHERE s.id = ? AND s.is_deleted = 0
      GROUP BY s.id
    `, [studentId]);

    if (!studentRows.length) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const student = studentRows[0];

    const [payments] = await pool.execute(`
      SELECT
        p.id,
        p.amount,
        p.payment_method,
        p.reference_no,
        p.remarks,
        p.payment_date
      FROM payments p
      WHERE p.student_ref_id = ?
      ORDER BY p.payment_date DESC
    `, [studentId]);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="receipt_${student.student_id}.pdf"`);
    doc.pipe(res);

    const pageWidth = doc.page.width;
    const margin = 50;
    const contentWidth = pageWidth - margin * 2;

    doc.rect(margin, margin, contentWidth, 70).fillAndStroke('#1a73e8', '#1a73e8');
    doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold')
       .text('SCHOOL FEE RECEIPT', margin, margin + 14, { width: contentWidth, align: 'center' });
    doc.fontSize(10).font('Helvetica')
       .text('School Fee Management System', margin, margin + 44, { width: contentWidth, align: 'center' });

 
    const receiptNo = `RCP-${student.student_id}-${Date.now().toString().slice(-6)}`;
    const printDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric',
    });

    doc.fillColor('#333333').fontSize(9).font('Helvetica')
       .text(`Receipt No: ${receiptNo}`, margin, margin + 90)
       .text(`Date: ${printDate}`, margin, margin + 104);
    const infoBoxY = margin + 126;
    doc.rect(margin, infoBoxY, contentWidth, 110).fillAndStroke('#f0f4ff', '#d0d8f0');
    doc.fillColor('#1a73e8').fontSize(11).font('Helvetica-Bold')
       .text('STUDENT DETAILS', margin + 12, infoBoxY + 12);

    const col1X = margin + 12;
    const col2X = margin + contentWidth / 2;
    let infoY = infoBoxY + 32;

    [['Student ID', student.student_id], ['Full Name', student.full_name], ['Class', student.class_name]]
      .forEach(([label, value]) => {
        doc.fillColor('#333333').fontSize(10)
           .font('Helvetica-Bold').text(`${label}:`, col1X, infoY, { continued: true })
           .font('Helvetica').text(`  ${value}`);
        infoY += 18;
      });

    infoY = infoBoxY + 32;
    [['Roll No', student.roll_no], ['Fee Status', student.fee_status]]
      .forEach(([label, value]) => {
        doc.fillColor('#333333').fontSize(10)
           .font('Helvetica-Bold').text(`${label}:`, col2X, infoY, { continued: true })
           .font('Helvetica').text(`  ${value}`);
        infoY += 18;
      });

    // ── FEE SUMMARY TABLE ──
    const summaryY = infoBoxY + 126;
    doc.fillColor('#1a73e8').fontSize(11).font('Helvetica-Bold')
       .text('FEE SUMMARY', margin, summaryY);

    const thY = summaryY + 18;
    doc.rect(margin, thY, contentWidth, 22).fillAndStroke('#1a73e8', '#1a73e8');
    doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold')
       .text('Description', margin + 8, thY + 6)
       .text('Amount (INR)', margin + contentWidth / 2 + 8, thY + 6);

    let rowY = thY + 22;
    [
      ['Total Fee',   student.total_fee],
      ['Paid Fee',    student.paid_fee],
      ['Pending Fee', student.pending_fee],
    ].forEach(([label, value], i) => {
      const isLast = i === 2;
      doc.rect(margin, rowY, contentWidth, 22)
         .fillAndStroke(i % 2 === 0 ? '#ffffff' : '#f5f8ff', '#d0d8f0');
      doc.fillColor(isLast && student.pending_fee > 0 ? '#c0392b' : '#333333')
         .fontSize(10).font(isLast ? 'Helvetica-Bold' : 'Helvetica')
         .text(label, margin + 8, rowY + 6)
         .text(`Rs. ${Number(value).toFixed(2)}`, margin + contentWidth / 2 + 8, rowY + 6);
      rowY += 22;
    });

    // ── PAYMENT HISTORY TABLE ──
    const historyY = rowY + 20;
    doc.fillColor('#1a73e8').fontSize(11).font('Helvetica-Bold')
       .text('PAYMENT HISTORY', margin, historyY);

    if (payments.length === 0) {
      doc.fillColor('#888888').fontSize(10).font('Helvetica')
         .text('No payments found for this student.', margin, historyY + 20);
    } else {
      const hthY = historyY + 18;
      doc.rect(margin, hthY, contentWidth, 22).fillAndStroke('#1a73e8', '#1a73e8');
      doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold')
         .text('#',      margin + 6,                 hthY + 6)
         .text('Date',   margin + 40,                hthY + 6)
         .text('Method', margin + 135,               hthY + 6)
         .text('Ref No', margin + 230,               hthY + 6)
         .text('Amount', margin + contentWidth - 80, hthY + 6);

      let hRowY = hthY + 22;
      payments.forEach((p, i) => {
        doc.rect(margin, hRowY, contentWidth, 20)
           .fillAndStroke(i % 2 === 0 ? '#ffffff' : '#f5f8ff', '#d0d8f0');
        const payDate = new Date(p.payment_date).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
        });
        doc.fillColor('#333333').fontSize(9).font('Helvetica')
           .text(String(i + 1),                       margin + 6,                 hRowY + 5)
           .text(payDate,                              margin + 40,                hRowY + 5)
           .text(p.payment_method || '-',              margin + 135,               hRowY + 5)
           .text(p.reference_no   || '-',              margin + 230,               hRowY + 5)
           .text(`Rs. ${Number(p.amount).toFixed(2)}`, margin + contentWidth - 80, hRowY + 5);
        hRowY += 20;
      });
    }

  
    const footerY = doc.page.height - 80;
    doc.moveTo(margin, footerY).lineTo(pageWidth - margin, footerY)
       .strokeColor('#d0d8f0').lineWidth(1).stroke();
    doc.fillColor('#888888').fontSize(9).font('Helvetica')
       .text('This is a computer-generated receipt and does not require a signature.',
             margin, footerY + 10, { width: contentWidth, align: 'center' })
       .text(`Generated on ${printDate} | School Fee Management System`,
             margin, footerY + 24, { width: contentWidth, align: 'center' });

    doc.end();

  } catch (error) {
    next(error);
  }
};
