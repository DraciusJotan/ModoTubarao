let estado = Dados.carregar();

const modalRegistro = document.getElementById('modal-registro');
const anuncio = document.getElementById('anuncio');

function iniciarAbas() {
  const abas = [...document.querySelectorAll('[role="tab"]')];

  function ativar(aba) {
    abas.forEach(outra => {
      const selecionada = outra === aba;
      outra.setAttribute('aria-selected', String(selecionada));
      outra.tabIndex = selecionada ? 0 : -1;
      document.getElementById(outra.getAttribute('aria-controls')).hidden = !selecionada;
    });
    aba.focus();
  }

  abas.forEach(aba => {
    aba.addEventListener('click', () => ativar(aba));
    aba.addEventListener('keydown', evento => {
      const indice = abas.indexOf(aba);
      let destino = null;
      if (evento.key === 'ArrowRight') destino = (indice + 1) % abas.length;
      else if (evento.key === 'ArrowLeft') destino = (indice - 1 + abas.length) % abas.length;
      else if (evento.key === 'Home') destino = 0;
      else if (evento.key === 'End') destino = abas.length - 1;
      else return;
      evento.preventDefault();
      ativar(abas[destino]);
    });
  });

  return { ativar, abas };
}

function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;
  const botao = document.getElementById('btn-tema');
  botao.setAttribute('aria-pressed', String(tema === 'escuro'));
  botao.querySelector('.tema-icone').textContent = tema === 'claro' ? '☾' : '☀';
}

const FRASES_SOLTAS = [
  { pose: 'biceps', texto: 'Carga que não sobe é carga que não conta.' },
  { pose: 'garrafa', texto: 'Bebeu água hoje? Isso também é treino.' },
  { pose: 'coracao', texto: 'Descanso não é preguiça: é onde o músculo cresce.' },
  { pose: 'corda', texto: 'Cinco minutos de aquecimento salvam semanas de lesão.' },
  { pose: 'halteres', texto: 'Técnica primeiro. A carga vem atrás.' },
  { pose: 'grafico', texto: 'Constância bate intensidade no longo prazo.' }
];

let indiceFrase = -1;

function estadoDoGuia(stats) {
  const hoje = chaveData(new Date());
  const treinouHoje = !!estado.treinos[hoje];
  const totalTreinos = Object.keys(estado.treinos).length;

  if (!totalTreinos) {
    return { pose: 'celular', texto: 'Registra o primeiro treino aí, eu cuido do gráfico.' };
  }

  const inicioSemana = chaveData(inicioDaSemana(new Date()));
  const naSemana = Object.keys(estado.treinos)
    .filter(d => d >= inicioSemana && d <= hoje).length;
  const faltam = estado.metaSemanal - naSemana;

  if (faltam <= 0 && stats.sequenciaAtual >= 2) {
    return { pose: 'chama', texto: `${stats.sequenciaAtual} semanas seguidas na meta. Modo tubarão ativado.` };
  }
  if (faltam <= 0) {
    return { pose: 'trofeu', texto: 'Meta da semana batida. Agora é manter.' };
  }
  const restante = faltam === 1 ? 'Falta 1 treino' : `Faltam ${faltam} treinos`;

  if (treinouHoje) {
    return { pose: 'biceps', texto: `Treino de hoje registrado. ${restante} pra fechar a semana.` };
  }
  return { pose: 'calendario', texto: `${restante} pra bater a meta da semana.` };
}

function mostrarGuia({ pose, texto }) {
  const balao = document.getElementById('guia-balao');
  const img = document.querySelector('#guia-mascote img');
  img.src = `assets/mascote/${pose}.png`;
  balao.textContent = texto;
  balao.classList.remove('trocando');
  void balao.offsetWidth;
  balao.classList.add('trocando');
}

const POSE_FUNDO = { descendo: 'halteres', subindo: 'grafico' };
const POSE_FRENTE = { descendo: 'corda', subindo: 'garrafa' };

function iniciarRolagem() {
  const oceano = document.getElementById('oceano');
  const tubaraoFundo = document.getElementById('tubarao-fundo');
  const tubaraoFrente = document.getElementById('tubarao-frente');
  let ultimoY = window.scrollY;
  let agendado = false;

  function aoRolar() {
    const y = window.scrollY;
    const desloc = y - ultimoY;
    ultimoY = y;
    agendado = false;

    if (Math.abs(desloc) < 6) return;

    const direcao = desloc > 0 ? 'descendo' : 'subindo';
    if (direcao === direcaoAtual) return;

    direcaoAtual = direcao;
    oceano.classList.toggle('descendo', direcao === 'descendo');
    oceano.classList.toggle('subindo', direcao === 'subindo');
    tubaraoFundo.src = `assets/mascote/${POSE_FUNDO[direcao]}.png`;
    tubaraoFrente.src = `assets/mascote/${POSE_FRENTE[direcao]}.png`;
  }

  window.addEventListener('scroll', () => {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(aoRolar);
  }, { passive: true });
}

let direcaoAtual = 'descendo';

function iniciarRevelacao() {
  const icones = document.querySelectorAll('.icone-secao');
  const observador = new IntersectionObserver(entradas => {
    entradas.forEach(entrada => {
      const icone = entrada.target;
      icone.classList.remove('revelar-descendo', 'revelar-subindo');
      if (entrada.isIntersecting) {

        void icone.offsetWidth;
        icone.classList.add(`revelar-${direcaoAtual}`);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });

  icones.forEach(icone => observador.observe(icone));
}

function linhaSerie(valores = {}) {
  const linha = document.createElement('div');
  linha.className = 'serie-linha';

  const nome = document.createElement('input');
  nome.type = 'text';
  nome.className = 'serie-nome';
  nome.placeholder = 'Exercício';
  nome.setAttribute('aria-label', 'Nome do exercício');
  nome.setAttribute('list', 'lista-exercicios');
  nome.value = valores.exercicio || '';

  const series = document.createElement('input');
  series.type = 'number';
  series.min = '1';
  series.placeholder = 'Séries';
  series.setAttribute('aria-label', 'Número de séries');
  series.value = valores.series || '';

  const reps = document.createElement('input');
  reps.type = 'number';
  reps.min = '1';
  reps.placeholder = 'Reps';
  reps.setAttribute('aria-label', 'Repetições por série');
  reps.value = valores.reps || '';

  const peso = document.createElement('input');
  peso.type = 'number';
  peso.min = '0';
  peso.step = '0.5';
  peso.placeholder = 'Kg';
  peso.setAttribute('aria-label', 'Carga em quilos');
  peso.value = valores.peso || '';

  const remover = document.createElement('button');
  remover.type = 'button';
  remover.className = 'btn-remover';
  remover.textContent = '✕';
  remover.setAttribute('aria-label', 'Remover este exercício');
  remover.addEventListener('click', () => linha.remove());

  linha.append(nome, series, reps, peso, remover);
  return linha;
}

function abrirRegistro(chave, gruposPre) {
  const treino = estado.treinos[chave];
  document.getElementById('reg-data').value = chave;
  document.getElementById('reg-duracao').value = treino ? treino.duracao : 60;
  document.getElementById('reg-notas').value = treino ? (treino.notas || '') : '';
  document.getElementById('titulo-modal').textContent = treino ? 'Editar treino' : 'Registrar treino';
  document.getElementById('btn-excluir').hidden = !treino;

  const gruposMarcados = treino ? treino.grupos : (gruposPre || []);
  document.querySelectorAll('#reg-grupos input').forEach(input => {
    input.checked = gruposMarcados.includes(input.value);
  });

  const intensidade = treino ? String(treino.intensidade) : '2';
  const radio = document.querySelector(`#reg-intensidade input[value="${intensidade}"]`);
  if (radio) radio.checked = true;

  const container = document.getElementById('reg-series');
  container.textContent = '';
  const series = treino && treino.series && treino.series.length ? treino.series : [{}];
  series.forEach(s => container.appendChild(linhaSerie(s)));

  modalRegistro.showModal();
}

function lerFormulario() {
  const chave = document.getElementById('reg-data').value;
  const grupos = [...document.querySelectorAll('#reg-grupos input:checked')].map(i => i.value);
  const intensidadeInput = document.querySelector('#reg-intensidade input:checked');

  const series = [...document.querySelectorAll('#reg-series .serie-linha')].map(linha => {
    const [nome, qtd, reps, peso] = linha.querySelectorAll('input');
    return {
      exercicio: nome.value.trim(),
      series: Number(qtd.value) || 1,
      reps: Number(reps.value) || 0,
      peso: Number(peso.value) || 0
    };
  }).filter(s => s.exercicio);

  return {
    data: chave,
    grupos: grupos.length ? grupos : ['corpo-inteiro'],
    duracao: Number(document.getElementById('reg-duracao').value) || 0,
    intensidade: Number(intensidadeInput ? intensidadeInput.value : 2),
    notas: document.getElementById('reg-notas').value.trim(),
    series,

    // Carimbo de edição, para reconciliar o histórico entre dispositivos.
    atualizadoEm: new Date().toISOString()
  };
}

function salvarTreino() {
  const treino = lerFormulario();
  const recordes = detectarRecordes(treino, estado.treinos);

  estado.treinos[treino.data] = treino;
  Dados.salvar(estado);
  renderizarTudo();

  const superados = recordes.filter(pr => pr.anterior);
  if (superados.length) celebrarRecordes(superados);
  else anunciar(`Treino de ${formatarData(treino.data)} salvo.`);
}

function anunciar(texto) {
  anuncio.textContent = '';
  setTimeout(() => { anuncio.textContent = texto; }, 60);
}

function celebrarRecordes(recordes) {
  const principal = recordes[0];
  const texto = recordes.length > 1
    ? `${recordes.length} novos recordes pessoais!`
    : 'Novo recorde pessoal!';
  const detalhe = `${principal.nome}: ${principal.peso} kg × ${principal.reps} reps` +
    (principal.anterior ? ` (antes: ${principal.anterior.peso} kg × ${principal.anterior.reps})` : '');

  const faixa = document.createElement('div');
  faixa.className = 'faixa-pr';
  faixa.setAttribute('role', 'status');

  const mascote = document.createElement('img');
  mascote.src = 'assets/mascote/trofeu.png';
  mascote.alt = '';

  const corpo = document.createElement('div');
  corpo.textContent = texto;
  const small = document.createElement('small');
  small.textContent = detalhe;
  corpo.appendChild(small);

  faixa.append(mascote, corpo);
  document.body.appendChild(faixa);

  anunciar(`${texto} ${detalhe}`);

  const semAnimacao = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!semAnimacao) soltarConfete();

  setTimeout(() => faixa.remove(), 4000);
}

function soltarConfete() {
  const palco = document.getElementById('celebracao');
  palco.hidden = false;
  palco.textContent = '';
  const cores = ['#4cb6e3', '#3971a1', '#fbc54b', '#1a203b', '#ffffff'];

  for (let i = 0; i < 45; i++) {
    const peca = document.createElement('span');
    peca.className = 'confete';
    peca.style.left = Math.random() * 100 + '%';
    peca.style.background = cores[i % cores.length];
    peca.style.animationDuration = (1.6 + Math.random() * 1.4) + 's';
    peca.style.animationDelay = (Math.random() * 0.5) + 's';
    palco.appendChild(peca);
  }

  setTimeout(() => { palco.hidden = true; palco.textContent = ''; }, 3600);
}

function renderizarTudo() {
  const treinos = estado.treinos;
  const temTreinos = Object.keys(treinos).length > 0;
  const stats = calcularEstatisticas(treinos, estado.metaSemanal);

  document.getElementById('boas-vindas').hidden = temTreinos;

  document.getElementById('stat-sequencia').textContent = stats.sequenciaAtual;
  document.getElementById('stat-sequencia-nota').textContent =
    `semanas com ${estado.metaSemanal}+ treinos`;
  document.getElementById('stat-recorde').textContent = stats.sequenciaRecorde;
  document.getElementById('stat-total').textContent = stats.total;
  document.getElementById('stat-volume').textContent =
    Math.round(stats.volume).toLocaleString('pt-BR');

  mostrarGuia(estadoDoGuia(stats));

  renderizarHeatmap(treinos, chave => abrirRegistro(chave));
  renderizarBarras(stats);
  renderizarRecordes(treinos);
  renderizarHistorico(treinos);
}

function renderizarBarras(stats) {
  const lista = document.getElementById('barras-grupos');
  lista.textContent = '';
  const maximo = Math.max(1, ...Object.values(stats.porGrupo));

  Object.entries(GRUPOS).forEach(([chave, rotulo]) => {
    const valor = stats.porGrupo[chave] || 0;
    const item = document.createElement('li');
    item.className = 'barra-item';

    const nome = document.createElement('span');
    nome.textContent = rotulo;

    const trilho = document.createElement('span');
    trilho.className = 'barra-trilho';
    const preenchida = document.createElement('span');
    preenchida.className = 'barra-preenchida';
    preenchida.style.width = (valor / maximo * 100) + '%';
    trilho.appendChild(preenchida);

    const contagem = document.createElement('span');
    contagem.className = 'barra-valor';
    contagem.textContent = `${valor}x`;

    item.append(nome, trilho, contagem);
    item.setAttribute('aria-label', `${rotulo}: ${valor} treinos nos últimos 12 meses`);
    lista.appendChild(item);
  });
}

function renderizarRecordes(treinos) {
  const container = document.getElementById('lista-prs');
  container.textContent = '';
  const recordes = Object.values(calcularRecordes(treinos))
    .sort((a, b) => b.rm - a.rm)
    .slice(0, 6);

  if (!recordes.length) {
    const vazio = document.createElement('p');
    vazio.className = 'vazio';
    vazio.textContent = 'Registre cargas nos seus treinos para o Modo Tubarão começar a detectar seus recordes automaticamente.';
    container.appendChild(vazio);
    return;
  }

  recordes.forEach(pr => {
    const item = document.createElement('div');
    item.className = 'pr-item';

    const info = document.createElement('div');
    const nome = document.createElement('div');
    nome.className = 'pr-nome';
    nome.textContent = pr.nome;
    const detalhe = document.createElement('div');
    detalhe.className = 'pr-detalhe';
    detalhe.textContent = `${pr.peso} kg × ${pr.reps} reps · ${formatarDataCurta(pr.data)}`;
    info.append(nome, detalhe);

    const carga = document.createElement('div');
    carga.className = 'pr-carga';
    carga.textContent = `${pr.rm.toFixed(0)} kg`;
    carga.title = '1RM estimado';

    item.append(info, carga);
    container.appendChild(item);
  });
}

function renderizarHistorico(treinos) {
  const lista = document.getElementById('historico');
  lista.textContent = '';

  const recentes = Object.values(treinos)
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 8);

  if (!recentes.length) {
    const vazio = document.createElement('li');
    const p = document.createElement('p');
    p.className = 'vazio';
    p.textContent = 'Nenhum treino registrado ainda.';
    vazio.appendChild(p);
    lista.appendChild(vazio);
    return;
  }

  recentes.forEach(treino => {
    const li = document.createElement('li');
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'hist-item';
    botao.addEventListener('click', () => abrirRegistro(treino.data));

    const esquerda = document.createElement('div');
    const data = document.createElement('div');
    data.className = 'hist-data';
    data.textContent = formatarData(treino.data);
    const meta = document.createElement('div');
    meta.className = 'hist-meta';
    const qtdSeries = (treino.series || []).length;
    const comCarga = qtdSeries === 1 ? '1 exercício com carga' : `${qtdSeries} exercícios com carga`;
    meta.textContent = `${treino.duracao} min` + (qtdSeries ? ` · ${comCarga}` : '');
    esquerda.append(data, meta);

    const tags = document.createElement('div');
    tags.className = 'hist-tags';
    (treino.grupos || []).forEach(g => {
      tags.appendChild(criarTag(GRUPOS[g] || 'Corpo inteiro', 'tag-grupo'));
    });

    botao.append(esquerda, tags);
    li.appendChild(botao);
    lista.appendChild(li);
  });
}

function exportarDados() {
  const blob = new Blob([JSON.stringify(estado, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `modo-tubarao-backup-${chaveData(new Date())}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importarDados(arquivo) {
  const leitor = new FileReader();
  leitor.onload = () => {
    try {
      const dados = JSON.parse(leitor.result);
      if (!dados || typeof dados.treinos !== 'object') throw new Error('formato inválido');
      estado = Object.assign(Dados.padrao(), dados);
      Dados.salvar(estado);
      aplicarTema(estado.tema);
      document.getElementById('meta-semanal').value = estado.metaSemanal;
      renderizarTudo();
      anunciar('Backup importado com sucesso.');
    } catch (e) {
      alert('Não foi possível ler este arquivo. Use um backup exportado pelo Modo Tubarão.');
    }
  };
  leitor.readAsText(arquivo);
}

function iniciar() {
  aplicarTema(estado.tema);
  document.getElementById('meta-semanal').value = estado.metaSemanal;

  const gruposContainer = document.getElementById('reg-grupos');
  Object.entries(GRUPOS).forEach(([valor, rotulo]) => {
    const label = document.createElement('label');
    label.className = 'opcao';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = valor;
    const span = document.createElement('span');
    span.textContent = rotulo;
    label.append(input, span);
    gruposContainer.appendChild(label);
  });

  const datalist = document.createElement('datalist');
  datalist.id = 'lista-exercicios';
  EXERCICIOS.forEach(ex => {
    const opcao = document.createElement('option');
    opcao.value = ex.nome;
    datalist.appendChild(opcao);
  });
  document.body.appendChild(datalist);

  const { ativar, abas } = iniciarAbas();
  Biblioteca.iniciar();
  iniciarRolagem();
  iniciarRevelacao();

  Gerador.iniciar(dia => {
    abrirRegistro(chaveData(new Date()), dia.grupos);
    ativar(abas[0]);
  });

  document.getElementById('btn-tema').addEventListener('click', () => {
    estado.tema = estado.tema === 'claro' ? 'escuro' : 'claro';
    aplicarTema(estado.tema);
    Dados.salvar(estado);
  });

  document.getElementById('guia-mascote').addEventListener('click', () => {
    indiceFrase = (indiceFrase + 1) % FRASES_SOLTAS.length;
    mostrarGuia(FRASES_SOLTAS[indiceFrase]);
  });

  document.getElementById('btn-registrar-topo')
    .addEventListener('click', () => abrirRegistro(chaveData(new Date())));
  document.querySelectorAll('[data-abrir-registro]').forEach(botao => {
    botao.addEventListener('click', () => abrirRegistro(chaveData(new Date())));
  });

  document.getElementById('btn-add-serie')
    .addEventListener('click', () => document.getElementById('reg-series').appendChild(linhaSerie()));

  document.getElementById('form-registro').addEventListener('submit', salvarTreino);
  document.getElementById('btn-cancelar').addEventListener('click', () => modalRegistro.close());
  document.getElementById('fechar-modal').addEventListener('click', () => modalRegistro.close());

  document.getElementById('btn-excluir').addEventListener('click', () => {
    const chave = document.getElementById('reg-data').value;
    if (!confirm(`Excluir o treino de ${formatarData(chave)}?`)) return;
    delete estado.treinos[chave];
    Dados.salvar(estado);
    modalRegistro.close();
    renderizarTudo();
    anunciar('Treino excluído.');
  });

  document.getElementById('meta-semanal').addEventListener('change', evento => {
    estado.metaSemanal = Number(evento.target.value);
    Dados.salvar(estado);
    renderizarTudo();
  });

  document.getElementById('btn-exportar').addEventListener('click', () => {
    exportarImagem(estado.treinos, calcularEstatisticas(estado.treinos, estado.metaSemanal));
  });

  document.getElementById('btn-exportar-dados').addEventListener('click', exportarDados);
  document.getElementById('btn-importar-dados')
    .addEventListener('click', () => document.getElementById('input-importar').click());
  document.getElementById('input-importar').addEventListener('change', evento => {
    if (evento.target.files[0]) importarDados(evento.target.files[0]);
    evento.target.value = '';
  });

  renderizarTudo();
}

document.addEventListener('DOMContentLoaded', iniciar);
