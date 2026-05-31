const { exec } = require("child_process");

exports.form = (req, res) => {

res.send(`

<link rel="stylesheet" href="/style.css">

<h1>Command Execution (vulnerable)</h1>

<form method="POST">
<input name="host" placeholder="Ping host">
<button>Ejecutar</button>
</form>

<a href="/">Volver</a>

`);
};

exports.vulnerable = (req, res) => {

const host = req.body.host;

exec("ping -c 2 " + host, (err, stdout) => {

res.send(`

<link rel="stylesheet" href="/style.css">

<h1>Resultado</h1>

<pre>${stdout}</pre>

<a href="/cmd">Volver</a>

`);
});
};

exports.formSafe = (req, res) => {

res.send(`

<link rel="stylesheet" href="/style.css">

<h1>Command Execution (safe)</h1>

<form method="POST">
<input name="host" placeholder="Ping host">
<button>Ejecutar</button>
</form>

<a href="/">Volver</a>

`);
};

