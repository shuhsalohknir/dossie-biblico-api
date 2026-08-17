const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '3mb' }));

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.log('Erro MongoDB:', err));

const userSchema = new mongoose.Schema({
  nome: String,
  email: { type: String, unique: true },
  senha: String,
  pontos: { type: Number, default: 0 },
  foto: { type: String, default: '' },
  biografia: { type: String, default: '' },
  perseveranca: { type: Number, default: 0 },
  ultimoCheckin: { type: String, default: null },
  palavrasHebraico: { type: [String], default: [] },
  cartas: { type: [Number], default: [] },
  nivelLiberado: { type: Number, default: 1 },
  progressoNivel1: { type: String, default: null },
  ultimaRoletaGratis: { type: String, default: null },
  ultimaJogadaGratis: { type: String, default: null },
  jogadaGratisCartas: { type: Boolean, default: false }
});
const User = mongoose.model('User', userSchema);

const postSchema = new mongoose.Schema({
  autorId: String,
  autorNome: String,
  autorFoto: { type: String, default: '' },
  texto: { type: String, default: '' },
  imagem: { type: String, default: '' },
  data: { type: String, default: '' },
  curtidas: { type: [String], default: [] },
  comentarios: [{
    autorId: String,
    autorNome: String,
    texto: String,
    data: String
  }]
}, { timestamps: true });
const Post = mongoose.model('Post', postSchema);

const avisoSchema = new mongoose.Schema({
  titulo: String,
  texto: String,
  link: { type: String, default: '' },
  data: { type: String, default: '' }
}, { timestamps: true });
const Aviso = mongoose.model('Aviso', avisoSchema);

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.replace('Bearer ', '');
  if (!token) return res.status(401).json({ erro: 'Não autorizado' });
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = data.id;
    next();
  } catch (e) {
    return res.status(401).json({ erro: 'Token inválido' });
  }
}

function formatUser(user) {
  return {
    id: user._id,
    nome: user.nome,
    email: user.email,
    pontos: user.pontos,
    foto: user.foto,
    biografia: user.biografia,
    perseveranca: user.perseveranca,
    ultimoCheckin: user.ultimoCheckin,
    palavrasHebraico: user.palavrasHebraico,
    cartas: user.cartas,
    nivelLiberado: user.nivelLiberado,
    progressoNivel1: user.progressoNivel1,
    ultimaRoletaGratis: user.ultimaRoletaGratis,
    ultimaJogadaGratis: user.ultimaJogadaGratis,
    jogadaGratisCartas: user.jogadaGratisCartas
  };
}

// CADASTRO
app.post('/api/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Preencha todos os campos' });
    }
    const emailNorm = email.toLowerCase().trim();
    const existe = await User.findOne({ email: emailNorm });
    if (existe) {
      return res.status(400).json({ erro: 'Este email já está cadastrado' });
    }
    const hash = await bcrypt.hash(senha, 10);
    const user = await User.create({
      nome: nome.trim(),
      email: emailNorm,
      senha: hash
    });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ ok: true, token, usuario: formatUser(user) });
  } catch (e) {
    console.log(e);
    res.status(500).json({ erro: 'Erro no cadastro' });
  }
});

// LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ erro: 'Preencha email e senha' });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ erro: 'Email ou senha incorretos' });
    }
    const ok = await bcrypt.compare(senha, user.senha);
    if (!ok) {
      return res.status(400).json({ erro: 'Email ou senha incorretos' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ ok: true, token, usuario: formatUser(user) });
  } catch (e) {
    console.log(e);
    res.status(500).json({ erro: 'Erro no login' });
  }
});

// BUSCAR USUÁRIO LOGADO
app.get('/api/usuario', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.json({ ok: true, usuario: formatUser(user) });
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao buscar usuário' });
  }
});

// SALVAR USUÁRIO
app.put('/api/usuario', auth, async (req, res) => {
  try {
    const permitidos = [
      'nome', 'pontos', 'foto', 'biografia',
      'perseveranca', 'ultimoCheckin',
      'palavrasHebraico', 'cartas', 'nivelLiberado',
      'progressoNivel1', 'ultimaRoletaGratis',
      'ultimaJogadaGratis', 'jogadaGratisCartas'
    ];
    const update = {};
    permitidos.forEach(function(campo) {
      if (req.body[campo] !== undefined) update[campo] = req.body[campo];
    });
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: update },
      { new: true }
    );
    if (!user) return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.json({ ok: true, usuario: formatUser(user) });
  } catch (e) {
    console.log(e);
    res.status(500).json({ erro: 'Erro ao salvar' });
  }
});

// FEED - listar
app.get('/api/posts', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).limit(50);
    res.json({ ok: true, posts });
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao listar posts' });
  }
});

// FEED - criar
app.post('/api/posts', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ erro: 'Usuário não encontrado' });
    const post = await Post.create({
      autorId: String(user._id),
      autorNome: user.nome,
      autorFoto: user.foto || '',
      texto: req.body.texto || '',
      imagem: req.body.imagem || '',
      data: new Date().toLocaleString('pt-BR'),
      curtidas: [],
      comentarios: []
    });
    res.json({ ok: true, post });
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao criar post' });
  }
});

// FEED - curtir
app.post('/api/posts/:id/curtir', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ erro: 'Post não encontrado' });
    const uid = String(req.userId);
    const idx = post.curtidas.indexOf(uid);
    if (idx === -1) post.curtidas.push(uid);
    else post.curtidas.splice(idx, 1);
    await post.save();
    res.json({ ok: true, post });
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao curtir' });
  }
});

// FEED - comentar
app.post('/api/posts/:id/comentar', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const post = await Post.findById(req.params.id);
    if (!post || !user) return res.status(404).json({ erro: 'Não encontrado' });
    post.comentarios.push({
      autorId: String(user._id),
      autorNome: user.nome,
      texto: req.body.texto || '',
      data: new Date().toLocaleString('pt-BR')
    });
    await post.save();
    res.json({ ok: true, post });
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao comentar' });
  }
});

// RANKING
app.get('/api/ranking', auth, async (req, res) => {
  try {
    const users = await User.find()
      .select('nome foto pontos email')
      .sort({ pontos: -1 })
      .limit(50);

    const ranking = users.map(function(u) {
      return {
        id: u._id,
        nome: u.nome,
        foto: u.foto || '',
        pontos: u.pontos || 0,
        email: u.email
      };
    });

    res.json({ ok: true, ranking });
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao carregar ranking' });
  }
});

// AVISOS - listar
app.get('/api/avisos', auth, async (req, res) => {
  try {
    const avisos = await Aviso.find().sort({ createdAt: -1 }).limit(50);
    res.json({ ok: true, avisos });
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao carregar avisos' });
  }
});

// AVISOS - criar
app.post('/api/avisos', auth, async (req, res) => {
  try {
    const { titulo, texto, link } = req.body;
    if (!titulo || !texto) {
      return res.status(400).json({ erro: 'Título e texto são obrigatórios' });
    }
    const aviso = await Aviso.create({
      titulo,
      texto,
      link: link || '',
      data: new Date().toLocaleString('pt-BR')
    });
    res.json({ ok: true, aviso });
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao criar aviso' });
  }
});

// health check
app.get('/', (req, res) => {
  res.json({ ok: true, msg: 'Dossiê Bíblico API online' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Servidor rodando na porta ' + PORT);
});