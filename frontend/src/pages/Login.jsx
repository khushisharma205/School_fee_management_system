import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');//admin@school.com
  const [password, setPassword] = useState('');//admin123
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (

    <div className="login-page">
      <div className="navbar">
  <marquee scrollamount="50" direction="left" speed="100px">School Fee Management System</marquee>
</div>
      <form className="login-card" onSubmit={handleSubmit}>
    
        <h1>School Fee Management</h1>
       
        {error && <div className="alert error">{error}</div>}
        <div className="form-group">
          <label>Email</label>
  
   <input
  type="email" placeholder='email'
  value={email}
  name='email'
  autoComplete="off"
  onChange={(e) => setEmail(e.target.value)}
  required
/>
        </div>
        <div className="form-group">
          <label>Password</label>
          {/* <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /> */}
<input
  type="password" placeholder='password'
  value={password}
  name='password'
  autoComplete="new-password"
  onChange={(e) => setPassword(e.target.value)}
  required
/>
        </div>
        <button className="btn primary full" type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
