
import { useEffect, useState } from 'react';
import api from '../api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Fees() {
  const [summaries, setSummaries] = useState([]);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({
    student_ref_id: '',
    amount: '',
    payment_method: 'cash',
    reference_no: '',
    remarks: ''
  });
  const [message, setMessage] = useState('');

  const loadData = async () => {
    const [summaryRes, historyRes] = await Promise.all([
      api.get('/fees/summary'),
      api.get('/fees/payments/history')
    ]);
    setSummaries(summaryRes.data);
    setHistory(historyRes.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fees/payments', form);
      setMessage('Payment added successfully');
      setForm({ student_ref_id: '', amount: '', payment_method: 'cash', reference_no: '', remarks: '' });
      loadData();
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Payment failed');
    }
  };

  const downloadFeeSummary = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Fee Summary', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

    autoTable(doc, {
      startY: 28,
      head: [['Student Name', 'Student ID', 'Total Fee', 'Paid Fee', 'Pending Fee', 'Status']],
      body: summaries.map(item => [
        item.full_name,
        item.student_id,
        `Rs ${item.total_fee}`,
        `Rs ${item.paid_fee}`,
        `Rs ${item.pending_fee}`,
        item.fee_status
      ]),
      headStyles: { fillColor: [37, 99, 235] },
      alternateRowStyles: { fillColor: [243, 246, 251] },
    });

    doc.save('fee_summary.pdf');
  };

  const downloadPaymentHistory = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Payment History', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

    autoTable(doc, {
      startY: 28,
      head: [['Date', 'Student Name', 'Amount', 'Method', 'Reference', 'Remarks']],
      body: history.map(item => [
        new Date(item.payment_date).toLocaleString(),
        item.full_name,
        `Rs ${item.amount}`,
        item.payment_method,
        item.reference_no || '-',
        item.remarks || '-'
      ]),
      headStyles: { fillColor: [37, 99, 235] },
      alternateRowStyles: { fillColor: [243, 246, 251] },
    });

    doc.save('payment_history.pdf');
  };


  const downloadReceipt = async (studentId) => {
    try {
      const { data: blob } = await api.get(`/fees/receipt/${studentId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt_${studentId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Receipt download failed');
    }
  };

  return (
    <div className="content-grid">
      {message && <div className="alert success">{message}</div>}

      <form className="card grid-form" onSubmit={handleSubmit}>
        <h3>Add Fee Payment</h3>
        <div className="form-group">
          <label>Student</label>
          <select value={form.student_ref_id} onChange={(e) => setForm({ ...form, student_ref_id: e.target.value })} required>
            <option value="">Select student</option>
            {summaries.map((student) => (
              <option key={student.id} value={student.id}>
                {student.full_name} ({student.student_id})
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Amount</label>
          <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Payment Method</label>
          <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="bank">Bank</option>
          </select>
        </div>
        <div className="form-group">
          <label>Reference No</label>
          <input type="text" value={form.reference_no} onChange={(e) => setForm({ ...form, reference_no: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Remarks</label>
          <textarea rows="3" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
        </div>
        <button className="btn primary" type="submit">Add Payment</button>
      </form>

      <div className="card table-wrap">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0 }}>Fee Summary</h3>
          <button
            className="btn primary small"
            type="button"
            onClick={downloadFeeSummary}
            disabled={summaries.length === 0}
          >
            ⬇ Download PDF
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Total Fee</th>
              <th>Paid Fee</th>
              <th>Pending Fee</th>
              <th>Status</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((item) => (
              <tr key={item.id}>
                <td>{item.full_name} ({item.student_id})</td>
                <td>₹{item.total_fee}</td>
                <td>₹{item.paid_fee}</td>
                <td>₹{item.pending_fee}</td>
                <td><span className={`badge ${item.fee_status.toLowerCase()}`}>{item.fee_status}</span></td>
                <td>
                  <button
                    className="btn small primary"
                    onClick={() => downloadReceipt(item.id)}
                  >
                    ⬇ Receipt
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card table-wrap">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0 }}>Payment History</h3>
          <button
            className="btn primary small"
            type="button"
            onClick={downloadPaymentHistory}
            disabled={history.length === 0}
          >
            ⬇ Download PDF
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Student</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Reference</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id}>
                <td>{new Date(item.payment_date).toLocaleString()}</td>
                <td>{item.full_name}</td>
                <td>₹{item.amount}</td>
                <td>{item.payment_method}</td>
                <td>{item.reference_no || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}