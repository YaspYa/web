function App() {
  const [user, setUser] = React.useState(null);
  const [adminAccess, setAdminAccess] = React.useState(false);
  const [error, setError] = React.useState(null);

  const email = getCookie("saved_email");
  const password = getCookie("saved_password");

  const [users, setUsers] = React.useState([]);
  const [offset, setOffset] = React.useState(0);
  const [limit, setLimit] = React.useState(15);
  const [tableError, setTableError] = React.useState(null);

  const [showUserList, setShowUserList] = React.useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch(host + "/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password,
          offset,
          limit
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Помилка запиту");
      setUsers(data);
      setError(null);
    } catch (err) {
      setUsers([]);
      setTableError(err.message);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch(host + '/user', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setUser(data);
      setAdminAccess(data.admin_access)
    } catch (err) {
      setError(err.message);
    }
  }

  React.useEffect(() => {
    if (email && password && user && offset !== "" && limit !== "" && adminAccess) {
      fetchUsers();
    }
  }, [user, offset, limit]);

  React.useEffect(() => {
    fetchUser();
  }, []);

  const getInput = (e) => {
    const val = e.target.value;
    if (val === "") {
      return ""
    } else {
      const num = parseInt(val, 10);
      if (!isNaN(num)) return (num);
    }
  }

  const handlePageBack = () => {
    setOffset((prev) => Math.max(0, prev - limit));
  };

  const handlePageNext = () => {
    setOffset((prev) => prev + limit);
  };

  // if (error) return <div>Помилка: {error}</div>;
  if (!user || error) return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems:'center', justifyContent:'center' }}>
       <h2>{!error? "Завантаження...": "❌Помилка завантаження"}</h2> 
    </div>
  )

  return (
    <>
      <div className="profile-wrapper">
        <img src="../img/profile.png" className="profile-image" />
        <div>
          <p>{user.name} {user.surname}</p>
          <p>{user.email}</p>
          <p>{user.phone}</p>
        </div>
      </div>
      <button onClick={logout} className="exit">Вийти</button>
      {adminAccess}
      {adminAccess &&
        <div className="user-list-wrapper">
          <h2 className="user-list-show-button" style={{ marginBottom: 8, padding: "4px 16px", borderBottom: !showUserList ? "2px solid black" : "" }} onClick={() => { setShowUserList(!showUserList) }}>Список користувачів {showUserList ? "▲" : "▼"}</h2>

          {error && <p style={{ color: "red" }}>❌ {tableError}</p>}

          {showUserList && users.length > 0 && (
            <>
              <table border="1" cellPadding="5">
                <thead>
                  <tr>
                    {Object.keys(users[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id || user.email}>
                      {Object.values(user).map((val, idx) => (
                        <td key={idx}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="table-navigation">
                <div>
                  <button onClick={handlePageBack} className="arrow" disabled={offset === 0}>← Назад</button>
                  <button onClick={handlePageNext} className="arrow" disabled={users.length != limit}>Далі →</button>
                </div>
                <input
                  type="number"
                  value={limit}
                  onChange={(e) => { setLimit(getInput(e)); setOffset(0) }}
                />

              </div>
            </>
          )}



        </div>
      }
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("main"));
root.render(<App />);
