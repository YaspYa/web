const NewsDetails = () => {
  const { id } = ReactRouterDOM.useParams();

  const email = getCookie("saved_email");
  const password = getCookie("saved_password");
  const [user, setUser] = React.useState(null);
  const [adminAccess, setAdminAccess] = React.useState(false);

  const [news, setNews] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [comments, setComments] = React.useState([]);
  const [content, setContent] = React.useState("");
  const [error, setError] = React.useState(null);
  
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
    fetch(host + "/news/" + id)
      .then((res) => res.json())
      .then((data) => {
        setNews(data[0]);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Помилка при завантаженні новини:", error);
        setLoading(false);
      });

    fetch(`${host}/news/${id}/comments`)
      .then(res => res.json())
      .then(data => setComments(data));
  }, []);


  const submitComment = async (e) => {
    e.preventDefault();
    await fetch(`${host}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, email, password, newsId: id })
    });
    setContent("");
    const updated = await fetch(`${host}/news/${id}/comments`);
    setComments(await updated.json());
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await fetch(`${host}/delete_comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, email, password })
      });

      if (!res.ok) throw new Error("Не вдалося видалити коментар");


      const updated = await fetch(`${host}/news/${id}/comments`);
      setComments(await updated.json());
    } catch (err) {
      console.error("Помилка видалення:", err);
    }
  };

  return (
    <>
      {news ?

        <div>
          {news ?
            <div className="news-details-wrapper">
              <h2>{news.title}</h2>
              <p>{new Date(news.created_at).toLocaleString()}</p>
              {news.image_path && (
                <img
                  src={host + "/imageGet/" + news.image_path}
                  alt="Новинне зображення"
                  style={{ maxHeight: "350px" }}
                />
              )}
              {news.text.split("\n").map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
              {/* <button className="delete" onClick={() => handleDelete(news.id)}>Видалити</button> */}
            </div>
            : <></>}
          <div className="coments-wrapper">
            <h3 style={{ marginBottom: 8 }}>Коментарі</h3>

            {email && password && <form onSubmit={submitComment}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Ваш коментар..."
                required
              />
              <button className="send-comnent" type="submit">Додати</button>
            </form>}

            <ul>
              {comments.map(comment => (
                <li key={comment.id}>
                  <strong>{comment.user_name || "Анонім"}:</strong> {comment.content}
                  <br /><p style={{ fontSize: "0.8em" }}>{new Date(comment.created_at).toLocaleString()}</p>
                  {adminAccess && <button onClick={() => handleDeleteComment(comment.id)}>Видалити</button>}

                </li>
              ))}
            </ul>


          </div>
        </div> :
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: 'center', justifyContent: 'center' }}>
          <h2>{!error ? "Завантаження..." : "❌Помилка завантаження"}</h2>
        </div>}</>
  );
};