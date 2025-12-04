import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get('/api/users').then(res => setUsers(res.data));
  }, []);

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users.map(u => (
          <li key={u.id}>{u.email} - {u.subscription_active ? 'Active' : 'Inactive'}</li>
        ))}
      </ul>
    </div>
  );
}

export default Users;
