import { useState, useEffect } from 'react';

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Fetch users from backend
  useEffect(() => {
    fetch('http://localhost:4000/users')
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch(console.error);
  }, []);

  // Add a new user
  const addUser = async () => {
    if (!name || !email) return alert('Please enter name and email');

    const response = await fetch('http://localhost:4000/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });

    if (response.ok) {
      const newUser = await response.json();
      setUsers((prev) => [...prev, newUser]);
      setName('');
      setEmail('');
    } else {
      alert('Failed to add user');
    }
  };

  return (
    <div>
      <h2>User Manager</h2>

      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={addUser}>Add User</button>

      <h3>Users List:</h3>
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.name} - {u.email}</li>
        ))}
      </ul>
    </div>
  );
}
