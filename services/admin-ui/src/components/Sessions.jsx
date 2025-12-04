import React, { useState, useEffect } from 'react';
import api from '../api';

function Sessions() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    api.get('/api/sessions').then(res => setSessions(res.data));
  }, []);

  return (
    <div>
      <h1>Active Sessions</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Endpoint</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(session => (
            <tr key={session.id}>
              <td>{session.id.slice(0,8)}</td>
              <td>{session.user_id}</td>
              <td>{session.endpoint_id}</td>
              <td>{session.status}</td>
              <td><button>Join Session</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Sessions;
