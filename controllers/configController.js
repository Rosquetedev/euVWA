exports.vulnerable = (req, res) => {
    try {
        throw new Error("La conexión a la base de datos falló para root@127.0.0.1 with password 'root123'"); // Error simulado
    } catch (err) {
        res.send(`
            <link rel="stylesheet" href="/style.css">
            <h1>Error 500 (vulnerable)</h1>
            <pre>${err.stack}</pre>
            <a href="/">Volver</a>
        `);
    }
};

