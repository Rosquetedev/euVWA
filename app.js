const express = require("express");

// Importación de rutas
const xssRoutes = require("./routes/xss");
const commandRoutes = require("./routes/command");
const fileRoutes = require("./routes/file");
const sqlRoutes = require("./routes/sql");
const accessRoutes = require("./routes/access");
const apiRoutes = require("./routes/api");
const configRoutes = require("./routes/config");

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.send(`
        <link rel="stylesheet" href="/style.css">
        <h1>UE-VWA LABORATORIO DE PRUEBAS DE LA UNIVERSIDAD EUROPEA</h1>

        <h2>1 & 2. XSS (Cross-Site Scripting)</h2>
        <ul>
            <li><a href="/xss/reflected">Reflected XSS</a></li>
            <li><a href="/xss/stored">Stored XSS</a></li>
            
            
        </ul>

        <h2>3. Command Execution</h2>
        <ul>
            <li><a href="/cmd">Command Execution</a></li>
            
        </ul>

        <h2>4. File Inclusion / Path Traversal</h2>
        <ul>
            <li><a href="/file">File Viewer</a></li>
            
        </ul>

        <h2>5. SQL Injection</h2>
        <ul>
            <li><a href="/sql">Login SQLi</a></li>
            
        </ul>

        <h2>6. Broken Access Control</h2>
        <ul>
            <li><a href="/admin">Panel Admin</a></li>
            
        </ul>

        <h2>7. Sensitive Data Exposure</h2>
        <ul>
            <li><a href="/api/users">User API</a></li>
            
        </ul>

        <h2>8. Security Misconfiguration</h2>
        <ul>
            <li><a href="/error">Crash Server</a></li>
            
        </ul>
    `);
});

// Montar todas las rutas
app.use("/xss", xssRoutes);
app.use("/", commandRoutes);
app.use("/", fileRoutes);
app.use("/", sqlRoutes);
app.use("/", accessRoutes);
app.use("/", apiRoutes);
app.use("/", configRoutes);

app.listen(PORT, () => {
    console.log("Server running on http://localhost:" + PORT);
});