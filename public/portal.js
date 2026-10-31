/* Script compartilhado do portal.
   Monta o menu lateral e o cabeçalho em todas as páginas
   e confere com o servidor se a pessoa está logada. */
(function () {
  var ICONES = {
    home:       '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    grupo:      '<circle cx="12" cy="8" r="3"/><circle cx="5" cy="10" r="2"/><circle cx="19" cy="10" r="2"/><path d="M6 20c0-3 3-5 6-5s6 2 6 5"/>',
    capelo:     '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
    livroAberto:'<path d="M2 5c3-1 7-1 10 1 3-2 7-2 10-1v14c-3-1-7-1-10 1-3-2-7-2-10-1z"/><path d="M12 6v14"/>',
    medline:    '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M12 8v6M9 11h6"/>',
    pessoa:     '<circle cx="12" cy="9" r="3.5"/><path d="M5 20c0-4 3-6 7-6s7 2 7 6z"/>',
    chat:       '<path d="M21 12a8 8 0 01-11.5 7.2L4 21l1.8-5A8 8 0 1121 12z"/><path d="M9 12h.01M12 12h.01M15 12h.01"/>',
    livro:      '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6"/>',
    grafico:    '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
    arquivo:    '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/>',
    arquivoTxt: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    calculadora:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>',
    envelope:   '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    perfil:     '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="10" r="3"/><path d="M6.5 18c1.5-3 9.5-3 11 0"/>',
    pasta:      '<path d="M3 6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>',
    calendario: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M8 3v4M16 3v4"/>',
    power:      '<path d="M12 3v9"/><path d="M6.5 6.5a8 8 0 1011 0"/>',
    lupa:       '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    barras:     '<path d="M4 6h16M4 12h16M4 18h16"/>',
    usuario:    '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7"/>',
    engrenagem: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>'
  };
  function svg(nome) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONES[nome] + '</svg>';
  }

  // Itens do menu. Quem tem "href" já tem página; os outros mostram um aviso.
  // Para criar uma página nova: adicione o href aqui e a rota no server.js.
  var ITENS = [
    { nome: 'Acessar o Moodle',        icone: 'grupo' },
    { nome: 'Manual do calouro',       icone: 'capelo' },
    { nome: 'Minha biblioteca',        icone: 'livroAberto' },
    { nome: 'Biblioteca Medline',      icone: 'medline' },
    { nome: 'Provas',                  icone: 'pessoa',      href: '/portal/provas' },
    { nome: 'Avaliação institucional', icone: 'chat',        href: '/portal/avaliacao' },
    { nome: 'Biblioteca',              icone: 'livro' },
    { nome: 'Disciplinas',             icone: 'grafico',     href: '/portal/disciplinas' },
    { nome: 'Documentos',              icone: 'arquivo',     href: '/portal/documentos' },
    { nome: 'Financeiro',              icone: 'calculadora', href: '/portal/financeiro' },
    { nome: 'Matrícula',               icone: 'arquivoTxt' },
    { nome: 'Mensagens',               icone: 'envelope',    href: '/portal/mensagens' },
    { nome: 'Perfil',                  icone: 'perfil',      href: '/portal/perfil' },
    { nome: 'Protocolo',               icone: 'pasta' },
    { nome: 'Tô Dentro',               icone: 'calendario' }
  ];

  var paginaAtual = document.body.dataset.pagina || 'Home';
  var conteudo = document.getElementById('conteudo');

  // ---------- Menu lateral ----------
  var menu = document.createElement('nav');
  menu.className = 'menu';
  menu.setAttribute('aria-label', 'Menu principal');
  menu.innerHTML = '<div class="logo"><img src="/imagens/faema.png" alt="UNIFAEMA"></div><ul id="lista-menu"></ul>';

  function itemMenu(nome, icone, href, ativo) {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = href || '#';
    if (!href) a.dataset.exemplo = nome;
    if (ativo) a.className = 'ativo';
    a.innerHTML = svg(icone);
    var s = document.createElement('span');
    s.textContent = nome;
    a.appendChild(s);
    li.appendChild(a);
    menu.querySelector('#lista-menu').appendChild(li);
    return a;
  }

  itemMenu('Home', 'home', '/portal', paginaAtual === 'Home');
  ITENS.forEach(function (i) { itemMenu(i.nome, i.icone, i.href, paginaAtual === i.nome); });
  var linkSair = itemMenu('Sair', 'power', '#', false);

  // ---------- Cabeçalho ----------
  var topo = document.createElement('header');
  topo.className = 'topo';
  topo.innerHTML =
    '<button class="btn-menu" id="btn-menu" type="button" aria-label="Abrir ou fechar o menu">' + svg('barras') + '</button>' +
    '<form class="busca" id="busca"><input type="text" placeholder="Procurar..." aria-label="Procurar">' +
      '<button type="submit" aria-label="Buscar">' + svg('lupa') + '</button></form>' +
    '<div class="espaco"></div>' +
    '<div class="ola" id="ola">Olá...</div>' +
    '<a href="/portal/mensagens" class="icone-chat" aria-label="Mensagens">' + svg('chat') + '</a>' +
    '<div class="perfil">' +
      '<button id="btn-perfil" type="button" aria-label="Abrir perfil">' + svg('usuario') + '</button>' +
      '<div class="perfil-caixa" id="caixa-perfil">' +
        '<div class="perfil-dados"><p>Perfil: <span id="p-perfil">Aluno</span></p>' +
          '<p>Unidade: CENTRO UNIVERSITÁRIO FAEMA (UNIFAEMA)</p>' +
          '<p>Usuário: <span id="p-usuario"></span></p><p>Nome: <span id="p-nome"></span></p></div>' +
        '<div class="perfil-links"><h4>Conta</h4>' +
          '<a href="/portal/perfil">Atualizar dados cadastrais / senha</a>' +
          '<button type="button" id="sair-perfil">Sair</button></div>' +
      '</div></div>';

  var rodape = document.createElement('footer');
  rodape.className = 'rodape';
  rodape.textContent = new Date().getFullYear() + ' © UNIFAEMA';

  var aviso = document.createElement('div');
  aviso.className = 'aviso';
  aviso.setAttribute('role', 'status');

  // ---------- Monta tudo na página ----------
  var principal = document.createElement('div');
  principal.className = 'principal';
  principal.appendChild(topo);
  principal.appendChild(conteudo);
  principal.appendChild(rodape);
  document.body.prepend(menu, principal);
  document.body.appendChild(aviso);

  // Home: cartões dourados
  var grade = document.getElementById('grade');
  if (grade) {
    ITENS.forEach(function (i) {
      var c = document.createElement('a');
      c.className = 'cartao';
      c.href = i.href || '#';
      if (!i.href) c.dataset.exemplo = i.nome;
      c.innerHTML = svg(i.icone);
      var t = document.createElement('strong');
      t.textContent = i.nome;
      c.appendChild(t);
      grade.appendChild(c);
    });
  }

  // ---------- Comportamento ----------
  var tempoAviso;
  function mostrarAviso(texto) {
    aviso.textContent = texto;
    aviso.classList.add('visivel');
    clearTimeout(tempoAviso);
    tempoAviso = setTimeout(function () { aviso.classList.remove('visivel'); }, 2500);
  }

  document.addEventListener('click', function (e) {
    var alvo = e.target.closest('[data-exemplo]');
    if (alvo) {
      e.preventDefault();
      mostrarAviso('"' + alvo.dataset.exemplo + '" é só um exemplo, a função ainda não existe.');
    }
    if (!e.target.closest('.perfil')) {
      document.getElementById('caixa-perfil').classList.remove('aberta');
    }
  });

  document.getElementById('btn-menu').addEventListener('click', function () {
    if (window.innerWidth > 900) document.body.classList.toggle('recolhido');
    else menu.classList.toggle('aberto');
  });
  document.getElementById('btn-perfil').addEventListener('click', function () {
    document.getElementById('caixa-perfil').classList.toggle('aberta');
  });
  document.getElementById('busca').addEventListener('submit', function (e) {
    e.preventDefault();
    mostrarAviso('A busca é só um exemplo.');
  });

  function sairDoPortal(e) {
    if (e) e.preventDefault();
    fetch('/api/logout', { method: 'POST' }).then(function () { window.location.href = '/'; });
  }
  linkSair.addEventListener('click', sairDoPortal);
  document.getElementById('sair-perfil').addEventListener('click', sairDoPortal);

  // Pergunta ao servidor quem está logado; se ninguém, volta ao login.
  fetch('/api/me')
    .then(function (r) {
      if (!r.ok) { window.location.href = '/'; return null; }
      return r.json();
    })
    .then(function (dados) {
      if (!dados) return;
      var matricula = dados.matricula || dados.usuario;
      var tipo = dados.perfil === 'admin' ? 'Administrador' : 'Aluno';
      document.getElementById('ola').textContent =
        'Olá ' + dados.nome + ' (' + matricula + ') - Perfil ' + tipo;
      document.getElementById('p-usuario').textContent = matricula;
      document.getElementById('p-nome').textContent = dados.nome;
      document.getElementById('p-perfil').textContent = tipo;

      // Só administradores veem o item "Administração" no menu.
      if (dados.perfil === 'admin') {
        var admin = itemMenu('Administração', 'engrenagem', '/admin', paginaAtual === 'Administração');
        var lista = menu.querySelector('#lista-menu');
        lista.insertBefore(admin.parentNode, linkSair.parentNode);
      }
    })
    .catch(function () { window.location.href = '/'; });
})();
