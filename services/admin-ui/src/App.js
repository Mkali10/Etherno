import React, { useState } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';

axios.defaults.baseURL = 'http://localhost:8080';
axios.defaults.withCredentials = true;

function Header() {
  return (
    <header style={{
      background: 'linear-gradient(90deg, #0033cc 0%, #0056ff 100%)',
      color: 'white',
      padding: '15px',
      fontSize: '24px',
      fontWeight: 'bold',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      🚀 Etheron Dashboard
    </header>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@etheron.com');
  const [password, setPassword] = useState('password');
  
  const handleLogin = async () => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      onLogin(res.data.user);
    } catch (error) {
      alert('Login failed');
    }
  };
  
  return (
    <div className="login">
      <h2>Login to Etheron</h2>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button onClick={handleLogin}>Login</button>
      <p><strong>Demo:</strong> admin@etheron.com / password</p>
    </div>
  );
}

function Sessions() {
  const [sessions, setSessions] = useState([]);
  
  React.useEffect(() => {
    axios.get('/api/sessions').then(res => setSessions(res.data));
  }, []);
  
  const createSession = async () => {
    const endpointId = 'endpoint-' + Math.random().toString(36).substr(2, 9);
    await axios.post('/api/sessions', { endpoint_id: endpointId });
    alert('Session created! ID: ' + endpointId);
  };
  
  return (
    <div>
      <h2>Active Sessions</h2>
      <button onClick={createSession} className="btn-primary">New Session</button>
      <table>
        <thead>
          <tr><th>ID</th><th>Status</th><th>Created</th></tr>
        </thead>
        <tbody>
          {sessions.map(s => (
            <tr key={s.id}>
              <td>{s.id.slice(0,8)}</td>
              <td>{s.status}</td>
              <td>{new Date(s.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={!user ? <Login onLogin={setUser} /> : <Sessions />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
