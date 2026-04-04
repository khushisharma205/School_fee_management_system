import { useEffect, useState } from 'react';
import api from '../api';
import StatCard from '../components/StatCard';

export default function Dashboard() {
  const [summary, setSummary] = useState({
    total_students: 0,
    total_collected_fee: 0,
    total_pending_fee: 0,
    total_paid_fee: 0
  });

  useEffect(() => {
    api.get('/dashboard/summary').then(({ data }) => setSummary(data));
  }, []);

  return (
    <div className="content-grid">
      <div className="stats-grid">
        <StatCard title="Total Students" value={summary.total_students} color="blue" />
        <StatCard title="Total Collected Fee" value={`₹${summary.total_collected_fee}`} color="green" />
        <StatCard title="Total Pending Fee" value={`₹${summary.total_pending_fee}`} color="orange" />
        <StatCard title="Total Paid Fee" value={`₹${summary.total_paid_fee}`} color="purple" />
      </div>
  
    </div>
  );
}
