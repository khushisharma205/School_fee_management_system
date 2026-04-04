
export default function StudentTable({ students, onEdit, onDelete }) {

  const downloadReceipt = async (studentId) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`http://localhost:5000/api/fees/receipt/${studentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      alert('Receipt download failed');
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${studentId}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="card table-wrap">
      <h3>All Students</h3>
      <table>
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Roll No</th>
            <th>Name</th>
            <th>Class</th>
            <th>Total Fee</th>
            <th>Paid</th>
            <th>Pending</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.length ? students.map((student) => (
            <tr key={student.id}>
              <td>{student.student_id}</td>
              <td>{student.roll_no}</td>
              <td>{student.full_name}</td>
              <td>{student.class_name}</td>
              <td>₹{student.total_fee}</td>
              <td>₹{student.paid_fee}</td>
              <td>₹{student.pending_fee}</td>
              <td><span className={`badge ${student.fee_status.toLowerCase()}`}>{student.fee_status}</span></td>
              <td className="action-group">
                <button className="btn small" onClick={() => onEdit(student)}>Edit</button>
                <button className="btn small danger" onClick={() => onDelete(student.id)}>Delete</button>
                <button
                  className="btn small primary"
                  onClick={() => downloadReceipt(student.id)}
                >
                  ⬇ Receipt
                </button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="9" className="empty-row">No students found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}