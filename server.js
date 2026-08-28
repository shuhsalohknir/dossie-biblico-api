confira para mim seesta tudo certo 

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json({ limit: '8mb' }));
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.log('Erro MongoDB:', err));
const ADMIN_EMAILS = [
  'shuhsalohknir@gmail.com',
  'pablosyziz@gmail.com'
];
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
  progressoNivel2: { type: String, default: null },
  nivel2Concluido: { type: Boolean, default: false },
  caso1Completo: { type: Boolean, default: false },
  casosCompletos: { type: Number, default: 0 },
  ultimaRoletaGratis: { type: String, default: null },
  ultimaJogadaGratis: { type: String, default: null },
  jogadaGratisCartas: { type: Boolean, default: false },
  planoAtivo: { type: Object, default: null },
  planosProgresso: { type: Object, default: {} }
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
  titulo: { type: String, default: '' },
  texto: { type: String, default: '' },
  link: { type: String, default: '' },
  video: { type: String, default: '' },
  imagem: { type: String, default: '' },
  data: { type: String, default: '' },
  autorId: String,
  autorNome: String
}, { timestamps: true });
const Aviso = mongoose.model('Aviso', avisoSchema);
const notifSchema = new mongoose.Schema({
  paraId: { type: String, index: true },
  deId: String,
  deNome: String,
  tipo: String,
  postId: String,
  comentarioId: { type: String, default: '' },
  texto: String,
  data: { type: String, default: '' },
  lida: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const Notificacao = mongoose.model('Notificacao', notifSchema);
const enqueteSchema = new mongoose.Schema({
  pergunta: { type: String, required: true },
  opcoes: [{
    texto: String,
    votos: { type: [String], default: [] }
  }],
  ativa: { type: Boolean, default: true },
  criadoPor: String,
  criadoPorNome: String,
  data: { type: String, default: '' }
}, { timestamps: true });
const Enquete = mongoose.model('Enquete', enqueteSchema);
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
async function isAdmin(userId) {
  const user = await User.findById(userId);
  if (!user) return false;
  const email = String(user.email || '').toLowerCase();
  return ADMIN_EMAILS.map(e => e.toLowerCase()).includes(email);
}
function formatUser(user) {
  return {
    id: user._id,
    nome: user.nome,
    email: user.email,
    pontos: user.pontos || 0,
    foto: user.foto || '',
    biografia: user.biografia || '',
    perseveranca: user.perseveranca || 0,
    ultimoCheckin: user.ultimoCheckin || null,
    palavrasHebraico: user.palavrasHebraico || [],
    cartas: user.cartas || [],
    nivelLiberado: user.nivelLiberado || 1,
    progressoNivel1: user.progressoNivel1 || null,
    progressoNivel2: user.progressoNivel2 || null,
    nivel2Concluido: !!user.nivel2Concluido,
    caso1Completo: !!user.caso1Completo,
    casosCompletos: user.casosCompletos || 0,
    ultimaRoletaGratis: user.ultimaRoletaGratis || null,
    ultimaJogadaGratis: user.ultimaJogadaGratis || null,
    jogadaGratisCartas: !!user.jogadaGratisCartas,
    planoAtivo: user.planoAtivo || null,
    planosProgresso: user.planosProgresso || {}
  };
}
app.post('/api/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Preencha todos os campos' });
    }
    const emailNorm = email.toLowerCase().trim();
    const existe = await User.findOne({ email: emailNorm });
    if (existe) return res.status(400).json({ erro: 'Este email já está cadastrado' });
    const hash = await bcrypt.hash(senha, 10);
    const user = await User.create({ nome: nome.trim(), email: emailNorm, senha: hash });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ ok: true, token, usuario: formatUser(user) });
  } catch (e) {
    console.log(e);
    res.status(500).json({ erro: 'Erro no cadastro' });
  }
});
app.post('/api/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ erro: 'Preencha email e senha' });
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(400).json({ erro: 'Email ou senha incorretos' });
    const ok = await bcrypt.compare(senha, user.senha);
    if (!ok) return res.status(400).json({ erro: 'Email ou senha incorretos' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ ok: true, token, usuario: formatUser(user) });
  } catch (e) {
    console.log(e);
    res.status(500).json({ erro: 'Erro no login' });
  }
});
app.get('/api/usuario', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.json({ ok: true, usuario: formatUser(user) });
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao buscar usuário' });
  }
});
app.put('/api/usuario', auth, async (req, res) => {
  try {
    const permitidos = [
      'nome', 'pontos', 'foto', 'biografia',
      'perseveranca', 'ultimoCheckin',
      'palavrasHebraico', 'cartas', 'nivelLiberado',
      'progressoNivel1', 'progressoNivel2',
      'nivel2Concluido', 'caso1Completo', 'casosCompletos',
      'ultimaRoletaGratis', 'ultimaJogadaGratis', 'jogadaGratisCartas',
      'planoAtivo', 'planosProgresso'
    ];
    const update = {};
    permitidos.forEach(function(campo) {
      if (req.body[campo] !== undefined) update[campo] = req.body[campo];
    });
    const user = await User.findByIdAndUpdate(req.userId, { $set: update }, { new: true });
    if (!user) return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.json({ ok: true, usuario: formatUser(user) });
  } catch (e) {
    console.log(e);
    res.status(500).json({ erro: 'Erro ao salvar' });
  }
});
app.get('/api/posts', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).limit(50);
    res.json({ ok: true, posts });
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao listar posts' });
  }
});
app.get('/api/posts/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ erro: 'Post não encontrado' });
    res.json({ ok: true, post });
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao buscar post' });
  }
});
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
app.post('/api/posts/:id/curtir', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ erro: 'Post não encontrado' });
    const uid = String(req.userId);
    const idx = post.curtidas.indexOf(uid);
    const eraNovaCurtida = idx === -1;
    if (eraNovaCurtida) post.curtidas.push(uid);
    else post.curtidas.splice(idx, 1);
    await post.save();
    if (eraNovaCurtida && String(post.autorId) !== uid) {
      const quem = await User.findById(req.userId);
      await Notificacao.create({
        paraId: String(post.autorId),
        deId: uid,
        deNome: quem ? quem.nome : 'Alguém',
        tipo: 'curtida',
        postId: String(post._id),
        comentarioId: '',
        texto: (quem ? quem.nome : 'Alguém') + ' curtiu seu post',
        data: new Date().toLocaleString('pt-BR'),
        lida: false
      });
    }
    res.json({ ok: true, post });
  } catch (e) {
    console.log(e);
    res.status(500).json({ erro: 'Erro ao curtir' });
  }
});
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
    const ultimo = post.comentarios[post.comentarios.length - 1];
    if (String(post.autorId) !== String(user._id)) {
      await Notificacao.create({
        paraId: String(post.autorId),
        deId: String(user._id),
        deNome: user.nome,
        tipo: 'comentario',
        postId: String(post._id),
        comentarioId: String(ultimo._id || ''),
        texto: user.nome + ' comentou no seu post',
        data: new Date().toLocaleString('pt-BR'),
        lida: false
      });
    }
    res.json({ ok: true, post });
  } catch (e) {
    console.log(e);
    res.status(500).json({ erro: 'Erro ao comentar' });
  }
});
app.put('/api/posts/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ erro: 'Post não encontrado' });
    if (String(post.autorId) !== String(req.userId)) {
      return res.status(403).json({ erro: 'Você só pode editar seus posts' });
    }
    if (req.body.texto !== undefined) post.texto = req.body.texto;
    if (req.body.imagem !== undefined) post.imagem = req.body.imagem;
    await post.save();
    res.json({ ok: true, post });
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao editar post' });
  }
});
app.delete('/api/posts/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ erro: 'Post não encontrado' });
    if (String(post.autorId) !== String(req.userId)) {
      return res.status(403).json({ erro: 'Você só pode excluir seus posts' });
    }
    await post.deleteOne();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao excluir post' });
  }
});
app.get('/api/ranking', auth, async (req, res) => {
  try {
    const users = await User.find().select('nome foto pontos email').sort({ pontos: -1 }).limit(50);
    const ranking = users.map(function(u) {
      return { id: u._id, nome: u.nome, foto: u.foto || '', pontos: u.pontos || 0, email: u.email };
    });
    res.json({ ok: true, ranking });
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao carregar ranking' });
  }
});
app.get('/api/avisos', auth, async (req, res) => {
  try {
    const avisos = await Aviso.find().sort({ createdAt: -1 }).limit(50);
    res.json({ ok: true, avisos });
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao carregar avisos' });
  }
});
app.post('/api/avisos', auth, async (req, res) => {
  try {
    if (!(await isAdmin(req.userId))) {
      return res.status(403).json({ erro: 'Apenas o administrador pode publicar avisos' });
    }
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ erro: 'Usuário não encontrado' });
    const titulo = (req.body.titulo || '').trim();
    const texto = (req.body.texto || '').trim();
    const link = (req.body.link || '').trim();
    const video = (req.body.video || '').trim();
    const imagem = req.body.imagem || '';
    if (!titulo || !texto) {
      return res.status(400).json({ erro: 'Título e texto são obrigatórios' });
    }
    const aviso = await Aviso.create({
      titulo, texto, link, video, imagem,
      data: new Date().toLocaleString('pt-BR'),
      autorId: String(user._id),
      autorNome: user.nome
    });
    res.json({ ok: true, aviso });
  } catch (e) {
    console.log(e);
    res.status(500).json({ erro: 'Erro ao criar aviso' });
  }
});
app.put('/api/avisos/:id', auth, async (req, res) => {
  try {
    if (!(await isAdmin(req.userId))) {
      return res.status(403).json({ erro: 'Apenas o administrador pode editar avisos' });
    }
    const update = { data: new Date().toLocaleString('pt-BR') + ' (editado)' };
    if (req.body.titulo !== undefined) update.titulo = String(req.body.titulo || '').trim();
    if (req.body.texto !== undefined) update.texto = String(req.body.texto || '').trim();
    if (req.body.link !== undefined) update.link = String(req.body.link || '').trim();
    if (req.body.video !== undefined) update.video = String(req.body.video || '').trim();
    if (req.body.imagem !== undefined) update.imagem = req.body.imagem || '';
    if (!update.titulo || !update.texto) {
      return res.status(400).json({ erro: 'Título e texto são obrigatórios' });
    }
    const aviso = await Aviso.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!aviso) return res.status(404).json({ erro: 'Aviso não encontrado' });
    res.json({ ok: true, aviso });
  } catch (e) {
    console.log(e);
    res.status(500).json({ erro: 'Erro ao editar aviso' });
  }
});
app.delete('/api/avisos/:id', auth, async (req, res) => {
  try {
    if (!(await isAdmin(req.userId))) {
      return res.status(403).json({ erro: 'Apenas o administrador pode excluir avisos' });
    }
    const aviso = await Aviso.findByIdAndDelete(req.params.id);
    if (!aviso) return res.status(404).json({ erro: 'Aviso não encontrado' });
    res.json({ ok: true });
  } catch (e) {
    console.log(e);
    res.status(500).json({ erro: 'Erro ao excluir aviso' });
  }
});
app.get('/api/notificacoes', auth, async (req, res) => {
  try {
    const lista = await Notificacao.find({ paraId: String(req.userId) })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ ok: true, notificacoes: lista });
  } catch (e) {
    console.log(e);
    res.status(500).json({ erro: 'Erro ao listar notificações' });
  }
});
app.post('/api/notificacoes/ler', auth, async (req, res) => {
  try {
    await Notificacao.updateMany(
      { paraId: String(req.userId), lida: false },
      { $set: { lida: true } }
    );
    res.json({ ok: true });
  } catch (e) {
    console.log(e);
    res.status(500).json({ erro: 'Erro ao marcar notificações' });
  }
});
app.post('/api/doar', auth, async (req, res) => {
  try {
    const pontos = Math.floor(Number(req.body.pontos || 0));
    if (!pontos || pontos < 1) {
      return res.status(400).json({ erro: 'Informe uma quantidade válida de pontos' });
    }
    const doador = await User.findById(req.userId);
    if (!doador) return res.status(404).json({ erro: 'Usuário não encontrado' });
    if ((doador.pontos || 0) < pontos) {
      return res.status(400).json({ erro: 'Pontos insuficientes' });
    }
    const adminEmails = ADMIN_EMAILS.map(e => e.toLowerCase());
    const admin = await User.findOne({ email: { $in: adminEmails } });
    if (!admin) return res.status(500).json({ erro: 'Conta da plataforma não encontrada' });
    if (String(admin._id) === String(doador._id)) {
      return res.status(400).json({ erro: 'A conta da plataforma não pode doar para si mesma' });
    }
    doador.pontos = (doador.pontos || 0) - pontos;
    admin.pontos = (admin.pontos || 0) + pontos;
    await doador.save();
    await admin.save();
    await Notificacao.create({
      paraId: String(admin._id),
      deId: String(doador._id),
      deNome: doador.nome || 'Alguém',
      tipo: 'doacao',
      postId: '',
      comentarioId: '',
      texto: (doador.nome || 'Alguém') + ' doou ' + pontos + ' pontos para a plataforma',
      data: new Date().toLocaleString('pt-BR'),
      lida: false
    });
    res.json({ ok: true, mensagem: 'Doação realizada com sucesso', usuario: formatUser(doador) });
  } catch (e) {
    console.log(e);
    res.status(500).json({ erro: 'Erro ao processar doação' });
  }
});
app.get('/api/enquetes', auth, async (req, res) => {
  try {
    const lista = await Enquete.find({ ativa: true }).sort({ createdAt: -1 }).limit(20);
    res.json({ ok: true, enquetes: lista });
  } catch (e) {
    console.log(e);
    res.status(500).json({ erro: 'Erro ao listar enquetes' });
  }
});
app.post('/api/enquetes', auth, async (req, res) => {
  try {
    if (!(await isAdmin(req.userId))) {
      return res.status(403).json({ erro: 'Apenas o administrador pode criar enquetes' });
    }
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ erro: 'Usuário não encontrado' });
    const pergunta = (req.body.pergunta || '').trim();
    let opcoes = req.body.opcoes || [];
    if (!pergunta) return res.status(400).json({ erro: 'Pergunta obrigatória' });
    if (!Array.isArray(opcoes) || opcoes.length < 2) {
      return res.status(400).json({ erro: 'Mínimo 2 opções' });
    }
    opcoes = opcoes.map(function(o) {
      if (typeof o === 'string') return { texto: o.trim(), votos: [] };
      return { texto: String(o.texto || '').trim(), votos: [] };
    }).filter(function(o) { return o.texto; });
    if (opcoes.length < 2) return res.status(400).json({ erro: 'Mínimo 2 opções válidas' });
    const enquete = await Enquete.create({
      pergunta, opcoes, ativa: true,
      criadoPor: String(user._id),
      criadoPorNome: user.nome,
      data: new Date().toLocaleString('pt-BR')
    });
    res.json({ ok: true, enquete });
  } catch (e) {
    console.log(e);
    res.status(500).json({ erro: 'Erro ao criar enquete' });
  }
});
app.post('/api/enquetes/:id/votar', auth, async (req, res) => {
  try {
    const enquete = await Enquete.findById(req.params.id);
    if (!enquete || !enquete.ativa) return res.status(404).json({ erro: 'Enquete não encontrada' });
    const uid = String(req.userId);
    const indice = Number(req.body.opcao);
    if (isNaN(indice) || indice < 0 || indice >= enquete.opcoes.length) {
      return res.status(400).json({ erro: 'Opção inválida' });
    }
    const jaVotou = enquete.opcoes.some(function(o) {
      return (o.votos || []).indexOf(uid) !== -1;
    });
    if (jaVotou) return res.status(400).json({ erro: 'Você já votou nesta enquete' });
    enquete.opcoes[indice].votos.push(uid);
    await enquete.save();
    res.json({ ok: true, enquete });
  } catch (e) {
    console.log(e);
    res.status(500).json({ erro: 'Erro ao votar' });
  }
});
app.post('/api/enquetes/:id/encerrar', auth, async (req, res) => {
  try {
    if (!(await isAdmin(req.userId))) {
      return res.status(403).json({ erro: 'Apenas o administrador pode encerrar enquetes' });
    }
    const enquete = await Enquete.findByIdAndUpdate(req.params.id, { $set: { ativa: false } }, { new: true });
    if (!enquete) return res.status(404).json({ erro: 'Enquete não encontrada' });
    res.json({ ok: true, enquete });
  } catch (e) {
    console.log(e);
    res.status(500).json({ erro: 'Erro ao encerrar enquete' });
  }
});
app.get('/', (req, res) => {
  res.json({ ok: true, msg: 'Dossiê Bíblico API online' });
});
const { PERGUNTAS_EVENTO } = require('./banco-evento');
const CUSTO_EVENTO = 100;
const TEMPO_PROVA_SEGUNDOS = 90;
const TOTAL_PERGUNTAS = 20;
function semanaEvento(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const oneJan = new Date(y, 0, 1);
  const week = Math.ceil((((d - oneJan) / 86400000) + oneJan.getDay() + 1) / 7);
  return y + '-W' + week;
}
function eventoAbertoAgora() {
  const br = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  const dia = br.getDay();
  return dia === 6 || dia === 0;
}
const eventoSchema = new mongoose.Schema({
  codigo: { type: String, unique: true },
  pote: { type: Number, default: 0 },
  status: { type: String, default: 'aberto' },
  inscritos: [{
    userId: String,
    nome: String,
    acertos: { type: Number, default: 0 },
    fezProva: { type: Boolean, default: false },
    inicioProva: { type: Date, default: null },
    ordem: { type: [Number], default: [] }
  }],
  vencedores: { type: [String], default: [] }
});
const Evento = mongoose.models.Evento || mongoose.model('Evento', eventoSchema);
async function getEventoAtual() {
  const codigo = semanaEvento(new Date());
  let ev = await Evento.findOne({ codigo });
  if (!ev) ev = await Evento.create({ codigo, pote: 0, status: 'aberto', inscritos: [] });
  return ev;
}
app.get('/api/evento', auth, async (req, res) => {
  try {
    const ev = await getEventoAtual();
    const inscrito = ev.inscritos.find(i => String(i.userId) === String(req.userId));
    res.json({
      ok: true,
      codigo: ev.codigo,
      pote: ev.pote,
      status: ev.status,
      aberto: eventoAbertoAgora() && ev.status === 'aberto',
      totalInscritos: ev.inscritos.length,
      inscrito: !!inscrito,
      fezProva: !!(inscrito && inscrito.fezProva),
      meusAcertos: inscrito ? inscrito.acertos : 0,
      custo: CUSTO_EVENTO,
      tempo: TEMPO_PROVA_SEGUNDOS
    });
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao carregar evento' });
  }
});
app.post('/api/evento/inscrever', auth, async (req, res) => {
  try {
    if (!eventoAbertoAgora()) return res.status(400).json({ erro: 'O evento só abre sábado e domingo' });
    const ev = await getEventoAtual();
    if (ev.status !== 'aberto') return res.status(400).json({ erro: 'Evento encerrado' });
    if (ev.inscritos.find(i => String(i.userId) === String(req.userId))) {
      return res.status(400).json({ erro: 'Você já está inscrito neste evento' });
    }
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ erro: 'Usuário não encontrado' });
    if ((user.pontos || 0) < CUSTO_EVENTO) {
      return res.status(400).json({ erro: 'Você precisa de ' + CUSTO_EVENTO + ' pontos' });
    }
    user.pontos -= CUSTO_EVENTO;
    await user.save();
    ev.pote += CUSTO_EVENTO;
    ev.inscritos.push({
      userId: String(user._id),
      nome: user.nome,
      acertos: 0,
      fezProva: false
    });
    await ev.save();
    res.json({
      ok: true,
      pote: ev.pote,
      usuario: {
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
        nivelLiberado: user.nivelLiberado
      }
    });
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao inscrever' });
  }
});
app.post('/api/evento/iniciar', auth, async (req, res) => {
  try {
    if (!eventoAbertoAgora()) return res.status(400).json({ erro: 'O evento só abre sábado e domingo' });
    const ev = await getEventoAtual();
    const inscrito = ev.inscritos.find(i => String(i.userId) === String(req.userId));
    if (!inscrito) return res.status(400).json({ erro: 'Inscreva-se primeiro' });
    if (inscrito.fezProva) return res.status(400).json({ erro: 'Você já fez a prova deste evento' });
    const ordem = PERGUNTAS_EVENTO.map((_, i) => i).sort(() => Math.random() - 0.5);
    inscrito.ordem = ordem;
    inscrito.inicioProva = new Date();
    await ev.save();
    const perguntas = ordem.map(function(i) {
      const p = PERGUNTAS_EVENTO[i];
      return { id: p.id, pergunta: p.pergunta, opcoes: p.opcoes };
    });
    res.json({
      ok: true,
      perguntas,
      tempo: TEMPO_PROVA_SEGUNDOS,
      terminaEm: new Date(inscrito.inicioProva.getTime() + TEMPO_PROVA_SEGUNDOS * 1000)
    });
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao iniciar prova' });
  }
});
app.post('/api/evento/enviar', auth, async (req, res) => {
  try {
    const ev = await getEventoAtual();
    const inscrito = ev.inscritos.find(i => String(i.userId) === String(req.userId));
    if (!inscrito) return res.status(400).json({ erro: 'Não inscrito' });
    if (inscrito.fezProva) return res.status(400).json({ erro: 'Prova já enviada' });
    if (!inscrito.inicioProva) return res.status(400).json({ erro: 'Prova não iniciada' });
    const limite = new Date(inscrito.inicioProva.getTime() + (TEMPO_PROVA_SEGUNDOS + 8) * 1000);
    if (new Date() > limite) {
      inscrito.fezProva = true;
      inscrito.acertos = 0;
      await ev.save();
      return res.json({ ok: true, acertos: 0, msg: 'Tempo esgotado' });
    }
    const respostas = req.body.respostas || [];
    let acertos = 0;
    inscrito.ordem.forEach(function(idx, n) {
      const p = PERGUNTAS_EVENTO[idx];
      if (Number(respostas[n]) === Number(p.certa)) acertos += 1;
    });
    inscrito.acertos = acertos;
    inscrito.fezProva = true;
    await ev.save();
    res.json({ ok: true, acertos, total: TOTAL_PERGUNTAS });
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao enviar prova' });
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Servidor rodando na porta ' + PORT);
});