import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

axios.defaults.baseURL = 'http://localhost:8080';

function EtheronHeader() {
  return (
    <header className="etheron-header">
      <h1>🚀 Etheron Dashboard</h1>
    </header>
  );
}

function Login({ setToken }) {
  const [email, setEmail] = useState('admin@etheron.com');
  const [password, setPassword] = useState('password');

  const login = async () => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
      setToken(res.data.token);
    } catch (e) {
      alert('Login failed');
    }
  };

  return (
    <div className="login-form">
      <h2>Etheron Login</h2>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@etheron.com" />
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" />
      <button onClick={login}>Login to Etheron</button>
    </div>
  );
}

function Sessions() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    axios.get('/api/sessions').then(res => setSessions(res.data));
  }, []);

  return (
    <div className="sessions">
      <h2>Etheron Active Sessions</h2>
      <table>
        <thead><tr><th>ID</th><th>Status</th><th>Time</th></tr></thead>
        <tbody>
          {sessions.map(s => (
            <tr key={s.id}>
              <td>{s.id?.slice(0,8)}</td>
              <td>{s.status}</td>
              <td>{s.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  return (
    <div className="app">
      <EtheronHeader />
      {!token ? <Login setToken={setToken} /> : <Sessions />}
    </div>
  );
}

export default App;
