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
      setCached(data.cached);
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
        setCached(false);
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
  const flushCache = async () => {
    try {
      await fetch("http://localhost:4000/users/flush-cache", {
        method: "POST",
      });
      // Refresh users after flush to see fresh data
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-gray-900 rounded-lg shadow-lg text-white">
      <h2 className="text-3xl font-semibold mb-6">User Manager</h2>

      <div className="flex flex-col space-y-4 mb-6">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:outline-none"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <div className="flex space-x-4 justify-center mb-6">
        <button
          onClick={addUser}
          className="px-5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 transition"
        >
          Add User
        </button>
        <button
          onClick={flushCache}
          className="px-5 py-2 rounded-md bg-red-600 hover:bg-red-700 transition"
        >
          Flush Redis Cache
        </button>
        <button
          onClick={fetchUsers}
          className="px-5 py-2 rounded-md bg-gray-700 hover:bg-gray-600 transition"
        >
          Refresh Users
        </button>
      </div>

      {addTime && (
        <p className="mb-4 text-green-400">Last add request took: {addTime} ms</p>
      )}

      <h3 className="text-2xl font-semibold mb-2">Users List:</h3>
      {fetchTime && (
        <p className="mb-4">
          Last fetch request took: <span className="font-mono">{fetchTime} ms</span>
          <br />
          Data source:{" "}
          <span className="font-semibold">
            {cached ? "Redis Cache" : "Database"}
          </span>
        </p>
      )}

      <div className="max-h-64 overflow-y-auto border border-gray-700 rounded-md p-4 space-y-2">
        {users.map((u) => (
          <div
            key={u.id}
            className="bg-gray-800 rounded-md px-4 py-2 flex justify-between"
          >
            <span>{u.id}.</span>
            <span> {u.name}</span>
            <span className="text-gray-400">{u.email}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
