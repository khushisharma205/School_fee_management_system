import { useState } from 'react';
import api from '../api';

export default function Search() {
  const [searchType, setSearchType] = useState('student-id');
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    try {
      const endpoint = searchType === 'student-id'
        ? `/search/student-id/${value}`
        : `/search/roll-no/${value}`;
      const { data } = await api.get(endpoint);
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Student not found');
    }
  };

  return (
    <div className="content-grid">
      <form className="card grid-form" onSubmit={handleSearch}>
        <h3>Search Module</h3>
        <div className="form-group">
          <label>Search Type</label>
          <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
            <option value="student-id">Search by Student ID</option>
            <option value="roll-no">Search by Roll No</option>
          </select>
        </div>
        <div className="form-group">
          <label>Value</label>
          <input type="text" value={value} onChange={(e) => setValue(e.target.value)} required />
        </div>
        <button className="btn primary" type="submit">Search</button>
      </form>

      {error && <div className="alert error">{error}</div>}

      {result && (
        <div className="card">
          <h3>Student Details</h3>
          <div className="detail-grid">
            <p><strong>Student ID:</strong> {result.student_id}</p>
            <p><strong>Roll No:</strong> {result.roll_no}</p>
            <p><strong>Name:</strong> {result.full_name}</p>
            <p><strong>Class:</strong> {result.class_name}</p>
            <p><strong>Parent:</strong> {result.parent_name || '-'}</p>
            <p><strong>Phone:</strong> {result.phone || '-'}</p>
            <p><strong>Total Fee:</strong> ₹{result.total_fee}</p>
            <p><strong>Paid Fee:</strong> ₹{result.paid_fee}</p>
            <p><strong>Pending Fee:</strong> ₹{result.pending_fee}</p>
            <p><strong>Status:</strong> {result.fee_status}</p>
          </div>
        </div>
      )}
    </div>
  );
}
