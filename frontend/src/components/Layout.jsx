import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar ">
        <div>
          <h2>School Fee Management</h2>
        
        </div>
        <nav className="nav-links ">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/students">Students</NavLink>
          <NavLink to="/fees">Fees</NavLink>
          <NavLink to="/search">Search</NavLink>
        </nav>
        <button className="btn danger" id="logout-btn" onClick={handleLogout}>Logout</button>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>School Fee Management System</h1>
            <p className="muted">Welcome, {user?.name || 'Admin'}</p>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
