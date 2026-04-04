export default function StatCard({ title, value, color = 'default' }) {
  return (
    <div className={`stat-card ${color}`}>
      <p>{title}</p>
      <h3>{value}</h3>
    </div>
  );
}
