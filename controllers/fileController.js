const fs = require("fs");
const path = require("path");

exports.form = (req, res) => {

res.send(`

<link rel="stylesheet" href="/style.css">

<h1>File Viewer (vulnerable)</h1>

<form method="POST">
<input name="file" placeholder="Filename">
<button>Abrir</button>
</form>

<a href="/">Volver</a>

`);
};

exports.vulnerable = (req, res) => {

const file = req.body.file;

const filePath = "files/" + file;

try {

const content = fs.readFileSync(filePath, "utf8");

res.send(`

<link rel="stylesheet" href="/style.css">

<h1>File Content</h1>

<pre>${content}</pre>

`);

} catch {

res.send("Error al leer el archivo");

}

};

exports.formSafe = (req, res) => {

res.send(`

<link rel="stylesheet" href="/style.css">

<h1>File Viewer (safe)</h1>

<form method="POST">
<input name="file" placeholder="Filename">
<button>Abrir</button>
</form>

<a href="/">Volver</a>

`);
};
