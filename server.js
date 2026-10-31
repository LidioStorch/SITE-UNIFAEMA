// Servidor do site SITE UNIFAEMA
// Requer Node.js 22.13 ou superior (usa node:sqlite).
// Rode com: npm start

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const os = require('os');
const { DatabaseSync } = require('node:sqlite');

const app = express();
const PORTA = Number(process.env.PORT || 3000);
const PERFIS = ['aluno', 'admin'];
const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
const CAMPOS_PERFIL = ['email', 'cpf', 'estado_natal', 'cidade_natal', 'telefone', 'nome_mae',
  'cep', 'pais', 'uf', 'cidade', 'tipo_logradouro', 'logradouro', 'numero', 'bairro', 'complemento'];

// Catálogo inicial informado para o portal. O INSERT OR IGNORE evita duplicar
// as disciplinas quando o servidor for reiniciado.
const CURSOS = ['Enfermagem', 'Fisioterapia', 'Ciências Contábeis', 'Direito'];
const DISCIPLINAS = [
  // Enfermagem — 3º período / 1º semestre
  ['Enfermagem', 3, 1, 'Microbiologia e Parasitologia', 80, 'Prof. Dr. Carlos Eduardo Mendes'],
  ['Enfermagem', 3, 1, 'Farmacologia Geral', 80, 'Profa. Ma. Juliana Rocha'],
  ['Enfermagem', 3, 1, 'Semiologia e Semiotécnica de Enfermagem I', 80, 'Profa. Esp. Patrícia Nogueira'],
  ['Enfermagem', 3, 1, 'Patologia Geral', 60, 'Prof. Me. Roberto Alves'],
  ['Enfermagem', 3, 1, 'Saúde Coletiva e Epidemiologia', 60, 'Profa. Ma. Helena Costa'],
  // Enfermagem — 4º período / 2º semestre
  ['Enfermagem', 4, 2, 'Semiologia e Semiotécnica de Enfermagem II', 80, 'Profa. Esp. Patrícia Nogueira'],
  ['Enfermagem', 4, 2, 'Farmacologia Aplicada à Enfermagem', 60, 'Profa. Ma. Juliana Rocha'],
  ['Enfermagem', 4, 2, 'Sistematização da Assistência de Enfermagem (SAE)', 80, 'Profa. Dra. Fernanda Lima'],
  ['Enfermagem', 4, 2, 'Enfermagem em Saúde da Mulher', 80, 'Profa. Ma. Camila Martins'],
  ['Enfermagem', 4, 2, 'Nutrição e Dietoterapia', 40, 'Profa. Esp. Beatriz Souza'],

  // Fisioterapia — 3º período / 1º semestre
  ['Fisioterapia', 3, 1, 'Cinesiologia e Biomecânica', 80, 'Prof. Me. Lucas Ferreira'],
  ['Fisioterapia', 3, 1, 'Fisiologia do Exercício', 60, 'Prof. Dr. Ricardo Gomes'],
  ['Fisioterapia', 3, 1, 'Avaliação Cinésio-Funcional', 80, 'Profa. Ma. Amanda Ribeiro'],
  ['Fisioterapia', 3, 1, 'Recursos Terapêuticos Manuais', 60, 'Prof. Esp. Diego Martins'],
  ['Fisioterapia', 3, 1, 'Patologia de Órgãos e Sistemas', 60, 'Prof. Me. Roberto Alves'],
  // Fisioterapia — 4º período / 2º semestre
  ['Fisioterapia', 4, 2, 'Cinesioterapia', 80, 'Prof. Me. Lucas Ferreira'],
  ['Fisioterapia', 4, 2, 'Eletrotermofototerapia', 80, 'Prof. Esp. Thiago Oliveira'],
  ['Fisioterapia', 4, 2, 'Hidroterapia e Mecanoterapia', 60, 'Profa. Ma. Amanda Ribeiro'],
  ['Fisioterapia', 4, 2, 'Fisioterapia Neurofuncional I', 80, 'Profa. Dra. Mariana Castro'],
  ['Fisioterapia', 4, 2, 'Imaginologia e Diagnóstico por Imagem', 40, 'Prof. Esp. Gabriel Santos'],

  // Ciências Contábeis — 1º período / 1º semestre
  ['Ciências Contábeis', 1, 1, 'Contabilidade Introdutória', 80, 'Prof. Me. Henrique Silva'],
  ['Ciências Contábeis', 1, 1, 'Teoria Geral da Administração', 60, 'Profa. Esp. Vanessa Dias'],
  ['Ciências Contábeis', 1, 1, 'Matemática Financeira', 80, 'Prof. Me. Marcos Paulo'],
  ['Ciências Contábeis', 1, 1, 'Economia e Mercado', 60, 'Prof. Dr. Fábio Teixeira'],
  ['Ciências Contábeis', 1, 1, 'Instituições de Direito Público e Privado', 60, 'Prof. Esp. André Luiz'],
  // Ciências Contábeis — 2º período / 2º semestre
  ['Ciências Contábeis', 2, 2, 'Contabilidade Comercial e Intermediária', 80, 'Prof. Me. Henrique Silva'],
  ['Ciências Contábeis', 2, 2, 'Contabilidade de Custos', 80, 'Profa. Ma. Clara Barbosa'],
  ['Ciências Contábeis', 2, 2, 'Direito Empresarial e Societário', 60, 'Prof. Esp. André Luiz'],
  ['Ciências Contábeis', 2, 2, 'Estatística Aplicada', 60, 'Prof. Me. Marcos Paulo'],
  ['Ciências Contábeis', 2, 2, 'Ética e Legislação Profissional Contábil', 40, 'Profa. Esp. Vanessa Dias'],

  // Direito — 9º período / 1º semestre
  ['Direito', 9, 1, 'Direito Processual do Trabalho', 80, 'Prof. Me. Gustavo Borges'],
  ['Direito', 9, 1, 'Direito Tributário I', 80, 'Prof. Dr. Sérgio Machado'],
  ['Direito', 9, 1, 'Prática Jurídica Real I (Cível e Trabalhista)', 80, 'Profa. Esp. Letícia Cavalcanti'],
  ['Direito', 9, 1, 'Direito Internacional Público e Privado', 60, 'Prof. Me. Leonardo Farias'],
  ['Direito', 9, 1, 'Trabalho de Curso I (Projeto de TCC)', 60, 'Profa. Dra. Renata Moura'],
  // Direito — 10º período / 2º semestre
  ['Direito', 10, 2, 'Direito Tributário II', 80, 'Prof. Dr. Sérgio Machado'],
  ['Direito', 10, 2, 'Direito Previdenciário', 60, 'Prof. Me. Gustavo Borges'],
  ['Direito', 10, 2, 'Prática Jurídica Real II (Penal e Constitucional)', 80, 'Profa. Esp. Letícia Cavalcanti'],
  ['Direito', 10, 2, 'Direito Ambiental e Agrário', 60, 'Prof. Me. Leonardo Farias'],
  ['Direito', 10, 2, 'Trabalho de Curso II (Defesa de TCC)', 60, 'Profa. Dra. Renata Moura']
];

// ---------- Banco de dados ----------
const caminhoBanco = process.env.DB_PATH || path.join(__dirname, 'banco.db');
const db = new DatabaseSync(caminhoBanco);
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario TEXT UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    nome TEXT NOT NULL,
    matricula TEXT NOT NULL DEFAULT '',
    perfil TEXT NOT NULL DEFAULT 'aluno',
    senha_temporaria INTEGER NOT NULL DEFAULT 0
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS perfil_dados (
    usuario_id INTEGER PRIMARY KEY,
    ${CAMPOS_PERFIL.map((c) => c + " TEXT NOT NULL DEFAULT ''").join(',\n    ')}
  )
`);

// Migração segura para bancos criados por versões anteriores do portal.
const colunasUsuarios = db.prepare('PRAGMA table_info(usuarios)').all().map((c) => c.name);
if (!colunasUsuarios.includes('perfil')) {
  db.exec("ALTER TABLE usuarios ADD COLUMN perfil TEXT NOT NULL DEFAULT 'aluno'");
}
if (!colunasUsuarios.includes('matricula')) {
  db.exec("ALTER TABLE usuarios ADD COLUMN matricula TEXT NOT NULL DEFAULT ''");
}
if (!colunasUsuarios.includes('senha_temporaria')) {
  db.exec('ALTER TABLE usuarios ADD COLUMN senha_temporaria INTEGER NOT NULL DEFAULT 0');
}

db.exec(`
  CREATE TABLE IF NOT EXISTS cursos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE
  );
  CREATE TABLE IF NOT EXISTS alunos (
    usuario_id INTEGER PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    curso_id INTEGER NOT NULL REFERENCES cursos(id),
    periodo_atual INTEGER NOT NULL CHECK (periodo_atual BETWEEN 1 AND 20)
  );
  CREATE TABLE IF NOT EXISTS aluno_periodos (
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    periodo INTEGER NOT NULL CHECK (periodo BETWEEN 1 AND 20),
    PRIMARY KEY (usuario_id, periodo)
  );
  CREATE TABLE IF NOT EXISTS disciplinas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    curso_id INTEGER NOT NULL REFERENCES cursos(id),
    periodo INTEGER NOT NULL CHECK (periodo BETWEEN 1 AND 20),
    semestre INTEGER NOT NULL CHECK (semestre IN (1, 2)),
    nome TEXT NOT NULL,
    carga_horaria INTEGER NOT NULL CHECK (carga_horaria > 0),
    professor TEXT NOT NULL DEFAULT '',
    UNIQUE (curso_id, periodo, nome)
  );
  CREATE INDEX IF NOT EXISTS idx_disciplinas_curso_periodo ON disciplinas(curso_id, periodo);
`);

const inserirCurso = db.prepare('INSERT OR IGNORE INTO cursos (nome) VALUES (?)');
for (const curso of CURSOS) inserirCurso.run(curso);

const buscarCurso = db.prepare('SELECT id FROM cursos WHERE nome = ?');
const inserirDisciplina = db.prepare(`
  INSERT OR IGNORE INTO disciplinas
    (curso_id, periodo, semestre, nome, carga_horaria, professor)
  VALUES (?, ?, ?, ?, ?, ?)
`);
for (const [curso, periodo, semestre, nome, cargaHoraria, professor] of DISCIPLINAS) {
  const cursoRow = buscarCurso.get(curso);
  inserirDisciplina.run(cursoRow.id, periodo, semestre, nome, cargaHoraria, professor);
}

// Usuário de teste (só se o banco estiver vazio).
const total = db.prepare('SELECT COUNT(*) AS n FROM usuarios').get().n;
if (total === 0) {
  db.prepare('INSERT INTO usuarios (usuario, senha_hash, nome, matricula, perfil) VALUES (?, ?, ?, ?, ?)')
    .run('aluno', bcrypt.hashSync('123456', 10), 'Aluno de Teste', '12345', 'aluno');
  console.log('Usuário de teste criado -> usuário: aluno | senha: 123456');
}
db.prepare("UPDATE usuarios SET matricula = '12345' WHERE usuario = 'aluno' AND matricula = ''").run();

// Administrador inicial (só se ainda não existir nenhum).
const admins = db.prepare("SELECT COUNT(*) AS n FROM usuarios WHERE perfil = 'admin'").get().n;
if (admins === 0) {
  db.prepare('INSERT INTO usuarios (usuario, senha_hash, nome, matricula, perfil) VALUES (?, ?, ?, ?, ?)')
    .run('admin', bcrypt.hashSync('admin123', 10), 'Administrador', '', 'admin');
  console.log('Administrador criado -> usuário: admin | senha: admin123 (troque antes de publicar o site)');
}

// ---------- Configuração ----------
app.use(express.json({ limit: '1mb' }));

const segredoSessao = process.env.SESSION_SECRET || 'ALTERE-ESTE-SEGREDO-ANTES-DE-PUBLICAR-UNIFAEMA';
if (!process.env.SESSION_SECRET) {
  console.warn('AVISO: defina SESSION_SECRET no ambiente antes de publicar o site na internet.');
}
app.use(session({
  secret: segredoSessao,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 2
  }
}));

app.use(express.static(path.join(__dirname, 'public')));

// ---------- Quem está logado ----------
function usuarioAtual(req) {
  if (!req.session.usuarioId) return null;
  const u = db.prepare(`
    SELECT id, usuario, nome, matricula, perfil, senha_temporaria
    FROM usuarios WHERE id = ?
  `).get(req.session.usuarioId);
  if (!u) return null;

  const vinculo = db.prepare(`
    SELECT a.curso_id, a.periodo_atual, c.nome AS curso
    FROM alunos a JOIN cursos c ON c.id = a.curso_id
    WHERE a.usuario_id = ?
  `).get(u.id);
  const periodos = db.prepare(
    'SELECT periodo FROM aluno_periodos WHERE usuario_id = ? ORDER BY periodo'
  ).all(u.id).map((p) => p.periodo);

  return {
    ...u,
    curso_id: vinculo?.curso_id ?? null,
    curso: vinculo?.curso ?? null,
    periodo_atual: vinculo?.periodo_atual ?? null,
    periodos
  };
}

function exigirLogin(req, res, next) {
  const u = usuarioAtual(req);
  if (!u) return res.redirect('/');
  if (u.senha_temporaria && req.path !== '/portal/perfil') {
    return res.redirect('/portal/perfil?trocarSenha=1');
  }
  next();
}

function exigirAdmin(req, res, next) {
  const u = usuarioAtual(req);
  if (!u) return res.redirect('/');
  if (u.perfil !== 'admin') return res.status(403).send('Acesso restrito a administradores.');
  next();
}

function apiAdmin(req, res, next) {
  const u = usuarioAtual(req);
  if (!u || u.perfil !== 'admin') {
    return res.status(403).json({ erro: 'Acesso restrito a administradores.' });
  }
  next();
}

function apiLogin(req, res, next) {
  const u = usuarioAtual(req);
  if (!u) return res.status(401).json({ erro: 'Não autenticado.' });
  const rotasPermitidasDuranteTroca = ['/api/me', '/api/perfil', '/api/perfil/senha'];
  if (u.senha_temporaria && !rotasPermitidasDuranteTroca.includes(req.path)) {
    return res.status(403).json({
      erro: 'Antes de acessar as disciplinas, altere sua senha temporária na página Perfil.',
      trocarSenha: true
    });
  }
  next();
}

// ---------- Páginas protegidas ----------
const PAGINAS = ['disciplinas', 'documentos', 'financeiro', 'mensagens', 'provas', 'avaliacao', 'perfil'];

app.get('/portal', exigirLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'privado', 'portal.html'));
});

app.get('/portal/:pagina', exigirLogin, (req, res) => {
  const pagina = req.params.pagina;
  if (!PAGINAS.includes(pagina)) return res.status(404).send('Página não encontrada.');
  res.sendFile(path.join(__dirname, 'privado', pagina + '.html'));
});

app.get('/admin', exigirAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'privado', 'admin.html'));
});

// ---------- API: login ----------
app.post('/api/login', (req, res) => {
  const { usuario, senha } = req.body || {};
  if (!usuario || !String(usuario).trim()) {
    return res.status(400).json({ erro: 'O campo usuário é obrigatório.' });
  }
  if (!senha) return res.status(400).json({ erro: 'O campo senha é obrigatório.' });

  const encontrado = db.prepare('SELECT * FROM usuarios WHERE usuario = ? COLLATE NOCASE')
    .get(String(usuario).trim());
  const senhaCerta = encontrado && bcrypt.compareSync(String(senha), encontrado.senha_hash);
  if (!senhaCerta) return res.status(401).json({ erro: 'Usuário ou senha incorretos.' });

  req.session.usuarioId = encontrado.id;
  const atual = usuarioAtual(req);
  res.json({
    ok: true,
    nome: atual.nome,
    perfil: atual.perfil,
    trocarSenha: Boolean(atual.senha_temporaria),
    curso: atual.curso,
    periodoAtual: atual.periodo_atual,
    periodos: atual.periodos
  });
});

app.get('/api/me', (req, res) => {
  const u = usuarioAtual(req);
  if (!u) return res.status(401).json({ erro: 'Não autenticado.' });
  res.json(u);
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// ---------- API: disciplinas visíveis ao usuário ----------
app.get('/api/disciplinas', apiLogin, (req, res) => {
  const u = usuarioAtual(req);
  let cursoId;
  let periodos;

  if (u.perfil === 'admin') {
    cursoId = Number(req.query.cursoId) || null;
    const periodoFiltro = Number(req.query.periodo) || null;
    periodos = periodoFiltro ? [periodoFiltro] : null;
    if (!cursoId && !periodos) {
      const lista = db.prepare(`
        SELECT d.id, c.nome AS curso, d.periodo, d.semestre, d.nome,
               d.carga_horaria, d.professor
        FROM disciplinas d JOIN cursos c ON c.id = d.curso_id
        ORDER BY c.nome, d.periodo, d.nome
      `).all();
      return res.json({ curso: null, periodoAtual: null, periodos: [], disciplinas: lista });
    }
  } else {
    const vinculo = db.prepare('SELECT curso_id, periodo_atual FROM alunos WHERE usuario_id = ?').get(u.id);
    if (!vinculo) {
      return res.status(403).json({ erro: 'Seu usuário ainda não foi vinculado a um curso e período. Procure a administração.' });
    }
    cursoId = vinculo.curso_id;
    periodos = db.prepare('SELECT periodo FROM aluno_periodos WHERE usuario_id = ? ORDER BY periodo')
      .all(u.id).map((p) => p.periodo);
    if (!periodos.length) periodos = [vinculo.periodo_atual];
  }

  let sql = `
    SELECT d.id, c.nome AS curso, d.periodo, d.semestre, d.nome,
           d.carga_horaria, d.professor
    FROM disciplinas d JOIN cursos c ON c.id = d.curso_id
    WHERE 1 = 1
  `;
  const args = [];
  if (cursoId) { sql += ' AND d.curso_id = ?'; args.push(cursoId); }
  if (periodos && periodos.length) {
    sql += ` AND d.periodo IN (${periodos.map(() => '?').join(',')})`;
    args.push(...periodos);
  }
  sql += ' ORDER BY d.periodo, d.semestre, d.nome';
  const disciplinas = db.prepare(sql).all(...args);
  res.json({
    curso: u.perfil === 'admin' ? null : u.curso,
    periodoAtual: u.perfil === 'admin' ? null : u.periodo_atual,
    periodos: periodos || [],
    disciplinas
  });
});

// ---------- API: perfil do próprio usuário ----------
function texto(v, max) { return String(v == null ? '' : v).trim().slice(0, max); }
function digitos(v) { return String(v == null ? '' : v).replace(/\D/g, ''); }

function validarPerfil(d) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return 'E-mail inválido.';
  if (d.cpf.length !== 11) return 'O CPF precisa ter 11 números.';
  if (!UFS.includes(d.estado_natal)) return 'Selecione o estado natal.';
  if (!d.cidade_natal) return 'Informe a cidade natal.';
  if (d.telefone.length < 10 || d.telefone.length > 11) return 'Telefone celular inválido.';
  if (d.nome_mae.length < 2) return 'Informe o nome da mãe.';
  if (d.cep.length !== 8) return 'O CEP precisa ter 8 números.';
  if (!d.pais) return 'Selecione o país.';
  if (!UFS.includes(d.uf)) return 'Selecione o estado do endereço.';
  const obrigatorios = [['cidade', 'a cidade'], ['tipo_logradouro', 'o tipo de logradouro'],
  ['logradouro', 'o logradouro'], ['numero', 'o número'], ['bairro', 'o bairro']];
  for (const [campo, nome] of obrigatorios) {
    if (!d[campo]) return 'Informe ' + nome + '.';
  }
  return null;
}

app.get('/api/perfil', apiLogin, (req, res) => {
  const u = usuarioAtual(req);
  const dados = db.prepare('SELECT * FROM perfil_dados WHERE usuario_id = ?').get(u.id) || {};
  res.json({
    nome: u.nome, usuario: u.usuario, matricula: u.matricula,
    curso: u.curso, periodo_atual: u.periodo_atual, periodos: u.periodos,
    senha_temporaria: Boolean(u.senha_temporaria), dados
  });
});

app.put('/api/perfil', apiLogin, (req, res) => {
  const b = req.body || {};
  const d = {
    email: texto(b.email, 120), cpf: digitos(b.cpf),
    estado_natal: texto(b.estado_natal, 2).toUpperCase(),
    cidade_natal: texto(b.cidade_natal, 80), telefone: digitos(b.telefone),
    nome_mae: texto(b.nome_mae, 80), cep: digitos(b.cep), pais: texto(b.pais, 40),
    uf: texto(b.uf, 2).toUpperCase(), cidade: texto(b.cidade, 80),
    tipo_logradouro: texto(b.tipo_logradouro, 20), logradouro: texto(b.logradouro, 100),
    numero: texto(b.numero, 10), bairro: texto(b.bairro, 60), complemento: texto(b.complemento, 60)
  };
  const erro = validarPerfil(d);
  if (erro) return res.status(400).json({ erro });

  const u = usuarioAtual(req);
  const colunas = CAMPOS_PERFIL.join(', ');
  const marcas = CAMPOS_PERFIL.map(() => '?').join(', ');
  const atualiza = CAMPOS_PERFIL.map((c) => `${c} = excluded.${c}`).join(', ');
  db.prepare(`
    INSERT INTO perfil_dados (usuario_id, ${colunas}) VALUES (?, ${marcas})
    ON CONFLICT(usuario_id) DO UPDATE SET ${atualiza}
  `).run(u.id, ...CAMPOS_PERFIL.map((c) => d[c]));
  res.json({ ok: true });
});

app.put('/api/perfil/senha', apiLogin, (req, res) => {
  const { senhaAtual, novaSenha, confirmaSenha } = req.body || {};
  if (!senhaAtual) return res.status(400).json({ erro: 'Informe a senha atual.' });
  if (!novaSenha || String(novaSenha).length < 8) {
    return res.status(400).json({ erro: 'A nova senha precisa ter pelo menos 8 caracteres.' });
  }
  if (novaSenha !== confirmaSenha) {
    return res.status(400).json({ erro: 'A confirmação da nova senha não confere.' });
  }
  const u = usuarioAtual(req);
  const linha = db.prepare('SELECT senha_hash FROM usuarios WHERE id = ?').get(u.id);
  if (!bcrypt.compareSync(String(senhaAtual), linha.senha_hash)) {
    return res.status(400).json({ erro: 'Senha atual incorreta.' });
  }
  db.prepare('UPDATE usuarios SET senha_hash = ?, senha_temporaria = 0 WHERE id = ?')
    .run(bcrypt.hashSync(String(novaSenha), 10), u.id);
  res.json({ ok: true });
});

// ---------- API: administração de usuários ----------
app.get('/api/admin/usuarios', apiAdmin, (req, res) => {
  const lista = db.prepare(`
    SELECT u.id, u.usuario, u.nome, u.matricula, u.perfil,
           c.nome AS curso, a.periodo_atual
    FROM usuarios u
    LEFT JOIN alunos a ON a.usuario_id = u.id
    LEFT JOIN cursos c ON c.id = a.curso_id
    ORDER BY u.perfil, u.nome
  `).all();
  res.json(lista);
});

app.post('/api/admin/usuarios', apiAdmin, (req, res) => {
  const { usuario, nome, matricula, senha, perfil, cursoId, periodoAtual, periodos } = req.body || {};
  const login = String(usuario || '').trim();
  if (!/^[a-zA-Z0-9._-]{3,30}$/.test(login)) {
    return res.status(400).json({ erro: 'Usuário: de 3 a 30 caracteres, só letras, números, ponto, hífen e sublinhado.' });
  }
  const nomeCompleto = String(nome || '').trim();
  if (nomeCompleto.length < 2 || nomeCompleto.length > 80) {
    return res.status(400).json({ erro: 'Nome: de 2 a 80 caracteres.' });
  }
  if (!senha || String(senha).length < 8) {
    return res.status(400).json({ erro: 'A senha precisa ter pelo menos 8 caracteres.' });
  }
  const tipo = PERFIS.includes(perfil) ? perfil : 'aluno';
  const mat = String(matricula || '').trim().slice(0, 20);
  const jaExiste = db.prepare('SELECT id FROM usuarios WHERE usuario = ? COLLATE NOCASE').get(login);
  if (jaExiste) return res.status(409).json({ erro: 'Já existe um usuário com esse nome de login.' });

  const querVincular = cursoId !== undefined || periodoAtual !== undefined;
  if (querVincular && tipo !== 'aluno') {
    return res.status(400).json({ erro: 'Somente usuários do tipo aluno podem ser vinculados a curso e período.' });
  }
  if (tipo === 'aluno' && !querVincular) {
    return res.status(400).json({ erro: 'Para cadastrar um aluno, selecione o curso e o período atual.' });
  }
  let curso = null;
  let pAtual = null;
  let listaPeriodos = [];
  if (querVincular) {
    curso = db.prepare('SELECT id FROM cursos WHERE id = ?').get(Number(cursoId));
    pAtual = Number(periodoAtual);
    if (!curso || !Number.isInteger(pAtual) || pAtual < 1 || pAtual > 20) {
      return res.status(400).json({ erro: 'Selecione um curso e informe um período válido.' });
    }
    listaPeriodos = Array.isArray(periodos) ? [...new Set(periodos.map(Number))] : (pAtual > 1 ? [pAtual - 1, pAtual] : [1]);
    if (!listaPeriodos.length || listaPeriodos.some((p) => !Number.isInteger(p) || p < 1 || p > 20)) {
      return res.status(400).json({ erro: 'A lista de períodos vinculados é inválida.' });
    }
    if (!listaPeriodos.includes(pAtual)) {
      return res.status(400).json({ erro: 'O período atual precisa estar entre os períodos liberados para o aluno.' });
    }
  }

  try {
    db.exec('BEGIN');
    const insercao = db.prepare(`
      INSERT INTO usuarios (usuario, senha_hash, nome, matricula, perfil, senha_temporaria)
      VALUES (?, ?, ?, ?, ?, 1)
    `).run(login, bcrypt.hashSync(String(senha), 10), nomeCompleto, mat, tipo);
    const novoId = Number(insercao.lastInsertRowid);
    if (querVincular) {
      db.prepare('INSERT INTO alunos (usuario_id, curso_id, periodo_atual) VALUES (?, ?, ?)')
        .run(novoId, curso.id, pAtual);
      const insPeriodo = db.prepare('INSERT INTO aluno_periodos (usuario_id, periodo) VALUES (?, ?)');
      for (const p of listaPeriodos) insPeriodo.run(novoId, p);
    }
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    if (String(e.message).includes('UNIQUE')) return res.status(409).json({ erro: 'Já existe um usuário com esse login.' });
    throw e;
  }
  res.status(201).json({ ok: true });
});

app.put('/api/admin/usuarios/:id/senha', apiAdmin, (req, res) => {
  const id = Number(req.params.id);
  const { senha } = req.body || {};
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: 'ID de usuário inválido.' });
  if (!senha || String(senha).length < 8) {
    return res.status(400).json({ erro: 'A senha precisa ter pelo menos 8 caracteres.' });
  }
  const r = db.prepare('UPDATE usuarios SET senha_hash = ?, senha_temporaria = 1 WHERE id = ?')
    .run(bcrypt.hashSync(String(senha), 10), id);
  if (r.changes === 0) return res.status(404).json({ erro: 'Usuário não encontrado.' });
  res.json({ ok: true, exigirTrocaNoProximoAcesso: true });
});

app.delete('/api/admin/usuarios/:id', apiAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: 'ID de usuário inválido.' });
  if (id === req.session.usuarioId) {
    return res.status(400).json({ erro: 'Você não pode excluir o seu próprio usuário.' });
  }
  const r = db.prepare('DELETE FROM usuarios WHERE id = ?').run(id);
  db.prepare('DELETE FROM perfil_dados WHERE usuario_id = ?').run(id);
  if (r.changes === 0) return res.status(404).json({ erro: 'Usuário não encontrado.' });
  res.json({ ok: true });
});

// ---------- API: cursos e vínculos acadêmicos (somente administrador) ----------
app.get('/api/admin/cursos', apiAdmin, (req, res) => {
  res.json(db.prepare('SELECT id, nome FROM cursos ORDER BY nome').all());
});

app.get('/api/admin/alunos', apiAdmin, (req, res) => {
  const alunos = db.prepare(`
    SELECT u.id AS usuario_id, u.usuario, u.nome, u.matricula,
           c.id AS curso_id, c.nome AS curso, a.periodo_atual
    FROM alunos a
    JOIN usuarios u ON u.id = a.usuario_id
    JOIN cursos c ON c.id = a.curso_id
    ORDER BY c.nome, a.periodo_atual, u.nome
  `).all();
  const periodosStmt = db.prepare('SELECT periodo FROM aluno_periodos WHERE usuario_id = ? ORDER BY periodo');
  res.json(alunos.map((a) => ({ ...a, periodos: periodosStmt.all(a.usuario_id).map((p) => p.periodo) })));
});

app.put('/api/admin/alunos/:id', apiAdmin, (req, res) => {
  const id = Number(req.params.id);
  const { cursoId, periodoAtual, periodos } = req.body || {};
  const curso = db.prepare('SELECT id FROM cursos WHERE id = ?').get(Number(cursoId));
  const pAtual = Number(periodoAtual);
  if (!Number.isInteger(id) || id <= 0 || !curso || !Number.isInteger(pAtual) || pAtual < 1 || pAtual > 20) {
    return res.status(400).json({ erro: 'Informe um aluno, curso e período válidos.' });
  }
  const usuario = db.prepare("SELECT id FROM usuarios WHERE id = ? AND perfil = 'aluno'").get(id);
  if (!usuario) return res.status(404).json({ erro: 'Aluno não encontrado.' });
  const lista = Array.isArray(periodos) ? [...new Set(periodos.map(Number))] : (pAtual > 1 ? [pAtual - 1, pAtual] : [1]);
  if (!lista.length || lista.some((p) => !Number.isInteger(p) || p < 1 || p > 20)) {
    return res.status(400).json({ erro: 'Informe períodos válidos.' });
  }
  if (!lista.includes(pAtual)) {
    return res.status(400).json({ erro: 'O período atual precisa estar entre os períodos liberados para o aluno.' });
  }
  try {
    db.exec('BEGIN');
    db.prepare(`
      INSERT INTO alunos (usuario_id, curso_id, periodo_atual) VALUES (?, ?, ?)
      ON CONFLICT(usuario_id) DO UPDATE SET curso_id = excluded.curso_id, periodo_atual = excluded.periodo_atual
    `).run(id, curso.id, pAtual);
    db.prepare('DELETE FROM aluno_periodos WHERE usuario_id = ?').run(id);
    const ins = db.prepare('INSERT INTO aluno_periodos (usuario_id, periodo) VALUES (?, ?)');
    for (const p of lista) ins.run(id, p);
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  res.json({ ok: true });
});

// ---------- API: cadastro de disciplinas (somente administrador) ----------
function validarDisciplina(body) {
  const cursoId = Number(body.cursoId);
  const periodo = Number(body.periodo);
  const semestre = Number(body.semestre);
  const cargaHoraria = Number(body.cargaHoraria);
  const nome = texto(body.nome, 120);
  const professor = texto(body.professor, 120);
  if (!db.prepare('SELECT id FROM cursos WHERE id = ?').get(cursoId)) return { erro: 'Curso inválido.' };
  if (!Number.isInteger(periodo) || periodo < 1 || periodo > 20) return { erro: 'Período inválido.' };
  if (![1, 2].includes(semestre)) return { erro: 'Semestre deve ser 1 ou 2.' };
  if (nome.length < 3) return { erro: 'Informe o nome da disciplina.' };
  if (!Number.isInteger(cargaHoraria) || cargaHoraria < 1 || cargaHoraria > 2000) return { erro: 'Carga horária inválida.' };
  if (professor.length < 2) return { erro: 'Informe o professor responsável.' };
  return { cursoId, periodo, semestre, nome, cargaHoraria, professor };
}

app.get('/api/admin/disciplinas', apiAdmin, (req, res) => {
  let sql = `
    SELECT d.id, d.curso_id AS cursoId, c.nome AS curso, d.periodo, d.semestre,
           d.nome, d.carga_horaria AS cargaHoraria, d.professor
    FROM disciplinas d JOIN cursos c ON c.id = d.curso_id WHERE 1 = 1
  `;
  const args = [];
  const cursoId = Number(req.query.cursoId);
  const periodo = Number(req.query.periodo);
  if (cursoId) { sql += ' AND d.curso_id = ?'; args.push(cursoId); }
  if (periodo) { sql += ' AND d.periodo = ?'; args.push(periodo); }
  sql += ' ORDER BY c.nome, d.periodo, d.nome';
  res.json(db.prepare(sql).all(...args));
});

app.post('/api/admin/disciplinas', apiAdmin, (req, res) => {
  const d = validarDisciplina(req.body || {});
  if (d.erro) return res.status(400).json({ erro: d.erro });
  try {
    const r = db.prepare(`
      INSERT INTO disciplinas (curso_id, periodo, semestre, nome, carga_horaria, professor)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(d.cursoId, d.periodo, d.semestre, d.nome, d.cargaHoraria, d.professor);
    res.status(201).json({ ok: true, id: Number(r.lastInsertRowid) });
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) return res.status(409).json({ erro: 'Essa disciplina já está cadastrada nesse curso e período.' });
    throw e;
  }
});

app.put('/api/admin/disciplinas/:id', apiAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: 'ID de disciplina inválido.' });
  const d = validarDisciplina(req.body || {});
  if (d.erro) return res.status(400).json({ erro: d.erro });
  try {
    const r = db.prepare(`
      UPDATE disciplinas SET curso_id = ?, periodo = ?, semestre = ?, nome = ?,
        carga_horaria = ?, professor = ? WHERE id = ?
    `).run(d.cursoId, d.periodo, d.semestre, d.nome, d.cargaHoraria, d.professor, id);
    if (!r.changes) return res.status(404).json({ erro: 'Disciplina não encontrada.' });
    res.json({ ok: true });
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) return res.status(409).json({ erro: 'Já existe uma disciplina com esse nome nesse curso e período.' });
    throw e;
  }
});

app.delete('/api/admin/disciplinas/:id', apiAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: 'ID de disciplina inválido.' });
  const r = db.prepare('DELETE FROM disciplinas WHERE id = ?').run(id);
  if (!r.changes) return res.status(404).json({ erro: 'Disciplina não encontrada.' });
  res.json({ ok: true });
});

// ---------- Iniciar ----------
app.listen(PORTA, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
  Object.values(os.networkInterfaces())
    .flat()
    .filter((i) => i && i.family === 'IPv4' && !i.internal)
    .forEach((i) => console.log(`Na rede: http://${i.address}:${PORTA}`));
});
