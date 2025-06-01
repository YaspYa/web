const NewsAdd = () => {
    const [title, setTitle] = React.useState("");
    const [text, setText] = React.useState("");
    const [imageFile, setImageFile] = React.useState(null);
    const [status, setStatus] = React.useState("");

    const email = getCookie("saved_email");
    const password = getCookie("saved_password");
    const navigate = ReactRouterDOM.useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!imageFile) return

        const formData = new FormData();
        formData.append("files", imageFile);

        try {
            const imageRes = await fetch(host + "/image", {
                method: "POST",
                body: formData,
            });

            const imageData = await imageRes.json();
            if (imageData.files && imageData.files.length > 0) {

                console.log(imageData.files[0].filename)
                try {
                    const res = await fetch(host + "/news", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ title, text, image_path: imageData.files[0].filename, email, password }),
                    });

                    if (!res.ok) throw new Error("Не вдалося створити новину");
                    setStatus("Новина успішно додана!");
                    setTitle("");
                    setText("");
                    setImageFile(null);
                    navigate("/");
                } catch (err) {
                    setStatus("Помилка при додаванні новини.");
                }
            }




        } catch (err) {
            return setStatus("Помилка при завантаженні зображення.");
        }

    };

    return (
        <div>
            <h2>Додати новину</h2>

            <form className="news-form" onSubmit={handleSubmit}>

                <label>Заголовок:</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} required />

                <label>Текст:</label>
                <textarea value={text} onChange={(e) => setText(e.target.value)} required />

                <label>Зображення:</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />

                <button className="send-comnent" type="submit">Створити</button>
            </form>

            {status && <p>{status}</p>}
        </div>
    );
};