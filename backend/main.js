const express = require('express');
const db = require('./db');
const app = express();
const cors = require('cors');
const bcrypt = require("bcrypt");
const multer = require("multer")
const path = require("path");
const fs = require("fs");

require("dotenv").config();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json("Притві з бекенду!");
});

const API_KEY = process.env.API_KEY;
const SOURCE = "UAH"

app.use((req, res, next) => {
  const delayMs = 300; 
  setTimeout(() => next(), delayMs);
});

function authorizeUser(email, password) {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
            if (err || !user) {
                return reject("Доступ заборонено: користувача не знайдено");
            }

            try {
                const match = await bcrypt.compare(password, user.password);
                if (!match) return reject("Доступ заборонено: невірний пароль");
                resolve(user);
            } catch (e) {
                reject("Помилка авторизації: " + e.message);
            }
        });
    });
}

//----------------------
//         USER
//----------------------

app.post('/register', async (req, res) => {
    const { name, surname, email, phone, password } = req.body;

    const hash = await bcrypt.hash(password, 10);

    const q = 'INSERT INTO users (name, surname, email, phone, password) VALUES (?, ?, ?, ?, ?)'
    db.run(q, [name, surname, email, phone, hash], function (err) {
        if (err) {
            if (err.message.includes("UNIQUE constraint failed: users.email")) {
                return res.status(400).json({ error: "Ця електронна адреса вже зареєстрована." });
            } else {
                return res.status(500).json({ error: "Серверна помилка: " + err.message });
            }
        }
        res.status(201).json({ message: 'Користувач доданий', id: this.lastID });
    }
    );
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const q = 'SELECT * FROM users WHERE email = ?'

    db.get(q, [email], async (err, user) => {
        if (err || !user) {
            return res.status(400).json({ error: "Користувача не знайдено" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            res.json({ message: "Вхід успішний" });
        } else {
            res.status(401).json({ error: "Невірний пароль" });
        }
    });
});

app.post('/user', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await authorizeUser(email, password);

        delete user.password;
        const admin_access = email == process.env.ADMIN_EMAIL
        res.json({ ...user, admin_access });

    } catch (error) {
        res.status(403).json({ error });
    }
});


app.post('/users', async (req, res) => {
    const { email, password, offset = 0, limit = 25 } = req.body;

    if (email !== process.env.ADMIN_EMAIL) {
        console.log(email, process.env.ADMIN_EMAIL)
        return res.status(403).json({ error: "Недостатньо прав." });
    }

    try {
        const user = await authorizeUser(email, password);

        const offsetNum = parseInt(offset, 10);
        const limitNum = parseInt(limit, 10);

        db.all('SELECT id, name, surname, phone, email FROM users LIMIT ? OFFSET ?', [limitNum, offsetNum], (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        });
    } catch (error) {
        res.status(403).json({ error });
    }

});

//----------------------
//         API
//----------------------

app.get("/currency", async (req, res) => {
    const apiUrl = `https://api.exchangerate.host/live?access_key=${API_KEY}&source=${SOURCE}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Помилка при запиті до API" });
    }
});

//----------------------
//         NEWS
//----------------------

app.get("/news", (req, res) => {
    db.all("SELECT * FROM news ORDER BY created_at DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get("/news/:id", (req, res) => {
    const newsId = req.params.id;

    db.all("SELECT * FROM news WHERE id = ?", [newsId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post("/news", async (req, res) => {
    const { title, text, image_path, email, password } = req.body;

    if (email !== process.env.ADMIN_EMAIL) {
        const fullPath = path.join(__dirname, "images", image_path);
        fs.unlink(fullPath, (err) => { });
        return res.status(403).json({ error: "Недостатньо прав." });
    }

    try {
        const user = await authorizeUser(email, password);

        db.run(
            "INSERT INTO news (title, text, image_path) VALUES (?, ?, ?)",
            [title, text, image_path],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ id: this.lastID });
            }
        );

    } catch (error) {
        res.status(403).json({ error });
    }
});

app.post("/news/:id", async (req, res) => {
    const { email, password } = req.body;
    const newsId = req.params.id;

    if (email !== process.env.ADMIN_EMAIL) {
        const fullPath = path.join(__dirname, "images", image_path);
        fs.unlink(fullPath, (err) => { });
        return res.status(403).json({ error: "Недостатньо прав." });
    }

    try {
        const user = await authorizeUser(email, password);

        db.get("SELECT * FROM news WHERE id = ?", [newsId], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ message: "Новину не знайдено" });

            const imagePath = row.image_path;

            db.run("DELETE FROM news WHERE id = ?", [newsId], function (err) {
                if (err) return res.status(500).json({ error: err.message });

                if (imagePath) {
                    const fullPath = path.join(__dirname, "images", imagePath);
                    fs.unlink(fullPath, (err) => {
                        if (err && err.code !== "ENOENT") {
                            console.error("Помилка при видаленні зображення:", err.message);
                            return res.status(500).json({ error: "Новину видалено, але не вдалося видалити зображення" });
                        }

                        res.json({ message: "Новину та зображення успішно видалено" });
                    });
                } else {
                    res.json({ message: "Новину успішно видалено (без зображення)" });
                }
            });
        });

    } catch (error) {
        res.status(403).json({ error });
    }

});

app.get("/news/:id/comments", (req, res) => {
    const newsId = req.params.id;

    db.all(
        `SELECT comments.*, users.name AS user_name 
     FROM comments 
     LEFT JOIN users ON comments.user_id = users.id
     WHERE news_id = ? ORDER BY created_at DESC`,
        [newsId],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        }
    );
});

app.post("/comments", async (req, res) => {
    const { newsId, content, email, password } = req.body;

    try {
        const user = await authorizeUser(email, password);

        db.run(
            "INSERT INTO comments (news_id, user_id, content) VALUES (?, ?, ?)",
            [newsId, user.id, content],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ id: this.lastID });
            }
        );
    } catch (error) {

        res.status(403).json({ error });
    }
});

app.post("/delete_comment", async (req, res) => {
    const { commentId, email, password } = req.body;

    if (email !== process.env.ADMIN_EMAIL) {
        const fullPath = path.join(__dirname, "images", image_path);
        fs.unlink(fullPath, (err) => { });
        return res.status(403).json({ error: "Недостатньо прав." });
    }

    try {
        const user = await authorizeUser(email, password);

        db.run("DELETE FROM comments WHERE id = ?", [commentId], function (err) {
            if (err) {
                return res.status(500).json({ error: "Помилка при видаленні коментаря." });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: "Коментар не знайдено." });
            }

            res.json({ message: "Коментар успішно видалено." });
        });
    } catch (error) {

        res.status(403).json({ error });
    }

});

//----------------------
//         IMAGES
//----------------------

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, path.join(__dirname, "images"));
    },
    filename: function (req, file, callback) {
        const ext = path.extname(file.originalname);
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}${ext}`;
        callback(null, uniqueName);
    }
});

const uploads = multer({ storage: storage });

app.post("/image", uploads.array("files"), (req, res) => {
    return res.json({ message: "Успішно завантажено", files: req.files });
});

app.get("/imageGet/:imgname", (req, res) => {
    const imgPath = path.join(__dirname, "images", req.params.imgname);
    res.sendFile(imgPath);
});



app.listen(7000, () => {
    console.log('Сервер працює на http://localhost:7000');
});