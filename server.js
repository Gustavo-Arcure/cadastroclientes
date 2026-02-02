const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.static("public")); // serve HTML, CSS, JS

const DADOS_PATH = path.join(__dirname, "public", "dados.json");
const EMPRESAS_PATH = path.join(__dirname, "public", "empresas.json");

// --------------------- CLIENTES ---------------------
// GET todos os clientes
app.get("/dados", (req, res) => {
  const dados = JSON.parse(fs.readFileSync(DADOS_PATH, "utf8"));
  res.json(dados);
});

// POST adicionar cliente
app.post("/dados", (req, res) => {
  const dados = JSON.parse(fs.readFileSync(DADOS_PATH, "utf8"));
  dados.push(req.body);
  fs.writeFileSync(DADOS_PATH, JSON.stringify(dados, null, 2));
  res.sendStatus(200);
});

// PUT atualizar cliente
app.put("/dados/:id", (req, res) => {
  const dados = JSON.parse(fs.readFileSync(DADOS_PATH, "utf8"));
  const index = dados.findIndex(c => c.id == req.params.id);
  if(index === -1) return res.sendStatus(404);
  dados[index] = req.body;
  fs.writeFileSync(DADOS_PATH, JSON.stringify(dados, null, 2));
  res.sendStatus(200);
});

// DELETE cliente
app.delete("/dados/:id", (req, res) => {
  let dados = JSON.parse(fs.readFileSync(DADOS_PATH, "utf8"));
  dados = dados.filter(c => c.id != req.params.id);
  fs.writeFileSync(DADOS_PATH, JSON.stringify(dados, null, 2));
  res.sendStatus(200);
});

// --------------------- EMPRESAS ---------------------
// GET todas as empresas
app.get("/empresas", (req, res) => {
  const empresas = JSON.parse(fs.readFileSync(EMPRESAS_PATH, "utf8"));
  res.json(empresas);
});

// POST adicionar empresa
app.post("/empresas", (req, res) => {
  const empresas = JSON.parse(fs.readFileSync(EMPRESAS_PATH, "utf8"));
  empresas.push(req.body.nome.toUpperCase());
  fs.writeFileSync(EMPRESAS_PATH, JSON.stringify(empresas, null, 2));
  res.sendStatus(200);
});

// DELETE empresa
app.delete("/empresas/:nome", (req, res) => {
  let empresas = JSON.parse(fs.readFileSync(EMPRESAS_PATH, "utf8"));
  const nome = decodeURIComponent(req.params.nome).toUpperCase();
  empresas = empresas.filter(e => e !== nome);
  fs.writeFileSync(EMPRESAS_PATH, JSON.stringify(empresas, null, 2));
  res.sendStatus(200);
});

// --------------------- INICIAR SERVIDOR ---------------------
const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
