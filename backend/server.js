import express from "express";
import multer from "multer";
import fs from "fs";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("frontend"));
app.use("/music", express.static("music"));

// Config upload
const storage = multer.diskStorage({
  destination: "music/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Arquivo de usuários
const USERS_FILE = "users.json";
const loadUsers = () =>
  fs.existsSync(USERS_FILE) ? JSON.parse(fs.readFileSync(USERS_FILE)) : [];
const saveUsers = (users) =>
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

// Listar
app.get("/users", (req, res) => {
  res.json(loadUsers());
});

// Adicionar usuário
app.post("/users", upload.single("musica"), (req, res) => {
  const { id, nome } = req.body;
  let users = loadUsers();

  // ✅ validação: não permitir ID duplicado
  if (users.find((u) => u.id === id)) {
    // se recebeu arquivo, remover pra não ficar lixo na pasta
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error("Erro ao remover arquivo não utilizado:", err);
      }
    }
    return res.status(400).json({ ok: false, error: "ID já cadastrado!" });
  }

  const musicaPath = req.file ? `music/${req.file.filename}` : null;

  users.push({ id, nome, musica: musicaPath });
  saveUsers(users);

  res.json({ ok: true });
});

// Deletar (remove usuário + música associada)
app.delete("/users/:id", (req, res) => {
  let users = loadUsers();
  const user = users.find((u) => u.id === req.params.id);

  if (user && user.musica && fs.existsSync(user.musica)) {
    try {
      fs.unlinkSync(user.musica);
      console.log(`🗑️ Música ${user.musica} removida.`);
    } catch (err) {
      console.error(`Erro ao remover música ${user.musica}:`, err);
    }
  }

  users = users.filter((u) => u.id !== req.params.id);
  saveUsers(users);

  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});
