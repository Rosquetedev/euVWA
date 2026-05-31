const escapeHtml = require("escape-html");

let comments = [];

exports.reflected = (req, res) => {

const name = req.query.name || "";

res.send(`

<link rel="stylesheet" href="/style.css">

<h1>Reflected XSS (vulnerable)</h1>

<form>
<input name="name">
<button>Envíar</button>
</form>

<p>Hola ${name}</p>

<a href="/">Volver</a>

`);

};


exports.storedForm = (req, res) => {

const list = comments.map(c => `<li>${c}</li>`).join("");

res.send(`

<link rel="stylesheet" href="/style.css">

<h1>Stored XSS (vulnerable)</h1>

<form method="POST">
<input name="comment">
<button>Envíar</button>
</form>

<ul>${list}</ul>

`);

};

exports.stored = (req, res) => {

comments.push(req.body.comment || "");

res.redirect("/xss/stored");

};


