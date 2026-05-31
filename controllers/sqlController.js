const sqlite3 = require("sqlite3").verbose();
// Base de datos temporal
const db = new sqlite3.Database(":memory:");
db.serialize(() => {
    db.run("CREATE TABLE users (username TEXT, password TEXT)");
    db.run("INSERT INTO users VALUES ('admin', 'password')");
});

exports.form = (req, res) => {
    res.send(`
        <link rel="stylesheet" href="/style.css">
        <h1>SQL Injection (vulnerable)</h1>
        <form method="POST">
            <input name="username" placeholder="Usuario">
            <input name="password" type="password" placeholder="Contraseña">
            <button>Login</button>
        </form>
        <a href="/">Volver</a>
    `);
};

exports.vulnerable = (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    // Inyección pura
    const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
    
    db.all(query, (err, rows) => {
        if (rows && rows.length > 0) {
            res.send(`<link rel="stylesheet" href="/style.css"><h1>Bienvenido ${rows[0].username}</h1><a href="/sql">Back</a>`);
        } else {
            res.send(`<link rel="stylesheet" href="/style.css"><h1>El login ha fallado</h1><a href="/sql">Back</a>`);
        }
    });
};

