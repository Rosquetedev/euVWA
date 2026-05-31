exports.vulnerable = (req, res) => {
    res.send(`
        <link rel="stylesheet" href="/style.css">
        <h1>Panel Admin (vulnerable)</h1>
        <p>Bienvenido al panel del admin.</p>
        <a href="/">Volver</a>
    `);
};

