import { useState, useEffect } from 'react';

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [fetchTime, setFetchTime] = useState(null);
  const [addTime, setAddTime] = useState(null);

  // Fetch users from backend with timing
  useEffect(() => {
    const fetchUsers = async () => {
      const start = performance.now(); // start timer

      try {
        const res = await fetch('http://localhost:4000/users');
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error(error);
      } finally {
        const end = performance.now(); // end timer
        setFetchTime((end - start).toFixed(2)); // time in ms with 2 decimals
      }
    };

    fetchUsers();
  }, []);

  // Add a new user with timing
  const addUser = async () => {
    if (!name || !email) return alert('Please enter name and email');

    const start = performance.now();

    try {
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
    } catch (error) {
      console.error(error);
    } finally {
      const end = performance.now();
      setAddTime((end - start).toFixed(2));
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
      {addTime && <p>Last add request took: {addTime} ms</p>}

      <h3>Users List:</h3>
      {fetchTime && <p>Last fetch request took: {fetchTime} ms</p>}
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.name} - {u.email}</li>
        ))}
      </ul>
    </div>
  );
}
