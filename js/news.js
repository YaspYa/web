const News = () => {
    const email = getCookie("saved_email");
    const password = getCookie("saved_password");

    const [user, setUser] = React.useState(null);
    const [adminAccess, setAdminAccess] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [newsList, setNewsList] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const Link = ReactRouterDOM.Link;

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
        fetchUser();
    }, []);

    React.useEffect(() => {
        fetch(host + "/news")
            .then((res) => res.json())
            .then((data) => {
                setNewsList(data);
                setLoading(false);
                console.log(data)
            })
            .catch((error) => {
                console.error("Помилка при завантаженні новин:", error);
                setError(true)
                setLoading(false);
            });
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Ви впевнені, що хочете видалити новину?")) return;

        try {
            const res = await fetch(`${host}/news/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });
            const result = await res.json();

            if (res.ok) {
                setNewsList((prev) => prev.filter((item) => item.id !== id));
            } else {
                alert("Помилка: " + result.message);
            }
        } catch (err) {
            console.error("Помилка при видаленні:", err);
            alert("Помилка при видаленні.");
        }
    };

    return (
        <div style={{ position: 'relative', height:"100%" }}>
            {adminAccess &&
                <Link to="/add" className="addNews">
                    Додати новину
                </Link>
            }

            <h1>Новини</h1>
            {newsList ?
                <div className="grid-wrapper">
                    {newsList.map((news) => (
                        <div className="news-wrapper">
                            <Link to={"/" + news.id} key={news.id} style={{ marginBottom: "20px" }}>
                                {news.image_path && (
                                    <div className="image-news-wrapper">
                                        <img
                                            src={host + "/imageGet/" + news.image_path}
                                            alt="Новинне зображення"
                                            style={{ maxHeight: "350px" }}
                                        />
                                    </div>
                                )}

                                <h2>{news.title}</h2>
                                <p style={{ fontSize: "0.8em" }}>{new Date(news.created_at).toLocaleString()}</p>
                                <p className="clamp-3">{news.text}</p>
                            </Link>
                            {adminAccess &&
                                <button className="delete" title="Видалити" onClick={() => handleDelete(news.id)}>🗑</button>
                            }

                        </div>
                    ))}

                </div> :
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: 'center', justifyContent: 'center' }}>
                    <h2>{!error? "Завантаження...": "❌Помилка завантаження"}</h2> 
                </div>}

        </div>
    );
};