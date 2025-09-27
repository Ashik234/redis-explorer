import { useState, useEffect } from "react";

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [fetchTime, setFetchTime] = useState(null);
  const [addTime, setAddTime] = useState(null);
  const [cached, setCached] = useState(null); // To show data source

  // Fetch users from backend with timing and cache info
  const fetchUsers = async () => {
    const start = performance.now();

    try {
      const res = await fetch("http://localhost:4000/users");
      const data = await res.json();
      setUsers(data.data);
      setCached(data.cached); // Expect cached flag in response
    } catch (error) {
      console.error(error);
    } finally {
      const end = performance.now();
      setFetchTime((end - start).toFixed(2));
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  // Add a new user with timing
  const addUser = async () => {
    if (!name || !email) return alert("Please enter name and email");

    const start = performance.now();

    try {
      const response = await fetch("http://localhost:4000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (response.ok) {
        const newUser = await response.json();
        setUsers((prev) => [...prev, newUser]);
        setName("");
        setEmail("");
        setCached(false); // New data is fresh, not from cache
      } else {
        alert("Failed to add user");
      }
    } catch (error) {
      console.error(error);
    } finally {
      const end = performance.now();
      setAddTime((end - start).toFixed(2));
    }
  };

  // Flush Redis cache
  // const flushCache = async () => {
  //   try {
  //     await fetch("http://localhost:4000/users/flush-cache", {
  //       method: "POST",
  //     });
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

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
      {fetchTime && (
        <p>
          Last fetch request took: {fetchTime} ms
          <br />
          Data source: <b>{cached ? "Redis Cache" : "Database"}</b>
        </p>
      )}
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.name} - {u.email}
          </li>
        ))}
      </ul>
      <button onClick={fetchUsers}>Refresh Users</button>
      {/* <button onClick={flushCache}>Flush Redis Cache</button> */}
    </div>
  );
}
