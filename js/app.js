let estado = Dados.carregar();

let snapshotRegistro = null;
const modalRegistro = document.getElementById('modal-registro');
const modalConta = document.getElementById('modal-conta');
const modalConfirmar = document.getElementById('modal-confirmar');
const anuncio = document.getElementById('anuncio');

// Substitui o confirm() nativo do navegador (feio e sem estilo) por um modal
// no visual do site. Resolve com 'principal', 'secundario' ou null (fechou sem
// escolher, ex.: Esc). Uso: if ((await confirmarComMascote('Excluir X?')) === 'principal') { ... }
function confirmarComMascote(mensagem, opcoes = {}) {
  const {
    titulo = 'Tem certeza?',
    textoPrincipal = 'Confirmar',
    textoSecundario = 'Cancelar',
    classePrincipal = 'btn-perigo',
    classeSecundario = 'btn-secundario'
  } = opcoes;

  return new Promise(resolve => {
    document.getElementById('titulo-confirmar').textContent = titulo;
    document.getElementById('confirmar-mensagem').textContent = mensagem;
    const btnSim = document.getElementById('btn-confirmar-sim');
    const btnNao = document.getElementById('btn-confirmar-nao');
    btnSim.textContent = textoPrincipal;
    btnNao.textContent = textoSecundario;
    btnSim.className = `btn ${classePrincipal}`;
    btnNao.className = `btn ${classeSecundario}`;

    function limpar(valor) {
      btnSim.removeEventListener('click', aoSim);
      btnNao.removeEventListener('click', aoNao);
      modalConfirmar.removeEventListener('cancel', aoCancelar);
      modalConfirmar.close();
      resolve(valor);
    }
    function aoSim() { limpar('principal'); }
    function aoNao() { limpar('secundario'); }
    function aoCancelar(evento) {
      evento.preventDefault();
      limpar(null);
    }

    btnSim.addEventListener('click', aoSim);
    btnNao.addEventListener('click', aoNao);
    modalConfirmar.addEventListener('cancel', aoCancelar);
    modalConfirmar.showModal();
  });
}

const AVATAR_PADRAO = 'assets/mascote/biceps.png';
let perfilAtual = { nome: '', foto: '' };
let nomeOriginal = '';
let usuarioLogado = null;

// Confirma com o usuário antes de fechar um modal com alterações não salvas.
// `mudou()` diz se há diferença; `salvar()` roda ao escolher "Salvar";
// `reverter()` devolve os campos em tela ao valor original ao escolher "Descartar"
// (sem isso, o campo continua mostrando o texto digitado mesmo sem ter sido salvo).
async function confirmarFechamento(modal, mudou, salvar, mensagem, reverter) {
  if (!mudou()) { modal.close(); return; }
  const resultado = await confirmarComMascote(mensagem, {
    titulo: 'Alterações não salvas',
    textoPrincipal: 'Salvar',
    classePrincipal: 'btn-primario',
    textoSecundario: 'Descartar',
    classeSecundario: 'btn-perigo'
  });
  if (resultado === 'principal') {
    try {
      await salvar();
      modal.close();
    } catch (e) {
      // Falhou salvar: deixa o modal aberto (a mensagem de erro já aparece
      // via salvarTreino/salvarPerfilAgora) pra não perder a alteração.
    }
  } else if (resultado === 'secundario') {
    if (reverter) reverter();
    modal.close();
  }
  // null (Esc/backdrop): continua editando, não fecha.
}

function mostrarErroConta(mensagem) {
  const erro = document.getElementById('conta-erro');
  erro.textContent = mensagem;
  erro.hidden = false;
}

function atualizarRotuloConta() {
  document.getElementById('conta-rotulo').textContent =
    perfilAtual.nome || (usuarioLogado ? usuarioLogado.email : 'Entrar');
}

// Navegador nenhum decodifica HEIC/HEIF (formato padrão da câmera em vários
// Android, principalmente Samsung com "formato de imagem eficiente" ligado).
// heic2any só é baixado se a foto realmente vier nesse formato — quem manda
// JPEG/PNG (a maioria) nunca carrega isso, então não pesa o app no dia a dia.
let heic2anyPromise = null;
function carregarHeic2any() {
  if (window.heic2any) return Promise.resolve(window.heic2any);
  if (!heic2anyPromise) {
    heic2anyPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js';
      script.onload = () => resolve(window.heic2any);
      script.onerror = () => reject(new Error('Não foi possível carregar o conversor de HEIC.'));
      document.head.appendChild(script);
    });
  }
  return heic2anyPromise;
}

function pareceHeic(arquivo) {
  const tipo = (arquivo.type || '').toLowerCase();
  const nome = (arquivo.name || '').toLowerCase();
  return tipo === 'image/heic' || tipo === 'image/heif' || nome.endsWith('.heic') || nome.endsWith('.heif');
}

// Recorta ao quadrado, reduz e comprime pra caber como miniatura no Firestore
// (sem precisar do Firebase Storage, que hoje exige conta de faturamento).
//
// Fotos tiradas direto da câmera do celular são bem mais pesadas (vários MB,
// 4000x3000px+) e costumam ter metadado de rotação (EXIF) que o <img> comum
// nem sempre respeita. createImageBitmap com imageOrientation:'from-image'
// lida com isso melhor e é o caminho preferido; caindo pra trás só em
// navegadores/WebViews mais antigos que não têm esse método.
async function comprimirImagem(arquivoOriginal) {
  let arquivo = arquivoOriginal;

  if (pareceHeic(arquivoOriginal)) {
    const heic2any = await carregarHeic2any();
    // Qualidade mais baixa aqui só acelera a conversão — a imagem final vai
    // ser reduzida a 160x160 de qualquer jeito no passo seguinte.
    const convertido = await heic2any({ blob: arquivoOriginal, toType: 'image/jpeg', quality: 0.7 });
    arquivo = Array.isArray(convertido) ? convertido[0] : convertido;
  }

  const tamanho = 160;
  const canvas = document.createElement('canvas');
  canvas.width = tamanho;
  canvas.height = tamanho;
  const ctx = canvas.getContext('2d');

  if (window.createImageBitmap) {
    try {
      const bitmap = await createImageBitmap(arquivo, { imageOrientation: 'from-image' });
      const lado = Math.min(bitmap.width, bitmap.height);
      ctx.drawImage(
        bitmap, (bitmap.width - lado) / 2, (bitmap.height - lado) / 2, lado, lado, 0, 0, tamanho, tamanho
      );
      if (bitmap.close) bitmap.close();
      return canvas.toDataURL('image/jpeg', 0.8);
    } catch (erro) {
      console.warn('createImageBitmap falhou, tentando modo alternativo:', erro);
    }
  }

  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    leitor.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Arquivo de imagem inválido ou formato não suportado.'));
      img.onload = () => {
        const lado = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - lado) / 2, (img.height - lado) / 2, lado, lado, 0, 0, tamanho, tamanho);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = leitor.result;
    };
    leitor.readAsDataURL(arquivo);
  });
}

function aoLogar(usuario) {
  usuarioLogado = usuario;
  document.getElementById('conta-explicacao').hidden = true;
  document.getElementById('form-conta').hidden = true;
  document.getElementById('conta-logado').hidden = false;
  document.getElementById('conta-email-atual').textContent = usuario.email;
  atualizarRotuloConta();

  Dados.aoSalvar = dados => Nuvem.salvarNuvem(dados);

  document.getElementById('perfil-avatar-wrap').classList.add('carregando');
  Nuvem.carregarPerfil(usuario.uid)
    .then(perfil => {
      perfilAtual = perfil || { nome: '', foto: '' };
      nomeOriginal = perfilAtual.nome || '';
      document.getElementById('perfil-nome').value = nomeOriginal;
      document.getElementById('perfil-foto-preview').src = perfilAtual.foto || AVATAR_PADRAO;
      atualizarRotuloConta();
    })
    .catch(e => console.error('Falha ao carregar perfil:', e))
    .finally(() => document.getElementById('perfil-avatar-wrap').classList.remove('carregando'));

  Nuvem.carregarNuvem(usuario.uid).then(dadosNuvem => {
    const temDadosNuvem = dadosNuvem && Object.keys(dadosNuvem.treinos || {}).length > 0;
    const temDadosLocais = Object.keys(estado.treinos).length > 0;

    if (temDadosNuvem) {
      estado = Object.assign(Dados.padrao(), dadosNuvem);
      Dados.salvar(estado);
      aplicarTema(estado.tema);
      document.getElementById('meta-semanal').value = estado.metaSemanal;
      renderizarTudo();
      anunciar('Treinos sincronizados da nuvem.');
    } else if (temDadosLocais) {
      Nuvem.salvarNuvem(estado);
      anunciar('Seus treinos foram enviados para a nuvem.');
    }
  });
}

function aoDeslogar() {
  usuarioLogado = null;
  perfilAtual = { nome: '', foto: '' };
  nomeOriginal = '';
  document.getElementById('conta-explicacao').hidden = false;
  document.getElementById('form-conta').hidden = false;
  document.getElementById('conta-logado').hidden = true;
  document.getElementById('perfil-nome').value = '';
  document.getElementById('perfil-foto-preview').src = AVATAR_PADRAO;
  document.getElementById('perfil-avatar-wrap').classList.remove('carregando');
  atualizarRotuloConta();
  Dados.aoSalvar = null;
}

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

let chaveRegistroAberto = null;
let gruposPreRegistroAberto = null;

// Preenche os campos do formulário a partir do que está salvo em estado.treinos
// (ou em branco, se for um treino novo) — sem abrir o modal. Usado tanto pra
// abrir o modal quanto pra reverter os campos quando o usuário descarta alterações.
function preencherFormularioRegistro(chave, gruposPre) {
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
}

function abrirRegistro(chave, gruposPre) {
  chaveRegistroAberto = chave;
  gruposPreRegistroAberto = gruposPre;
  preencherFormularioRegistro(chave, gruposPre);
  modalRegistro.showModal();
  snapshotRegistro = tirarSnapshotRegistro();
}

function tirarSnapshotRegistro() {
  const dados = lerFormulario();
  delete dados.atualizadoEm;
  return JSON.stringify(dados);
}

function registroMudou() {
  return snapshotRegistro !== null && tirarSnapshotRegistro() !== snapshotRegistro;
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
  modalRegistro.close();

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

  if (typeof Calorias !== 'undefined') Calorias.renderizar();
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
  Exportar.salvar(blob, `modo-tubarao-backup-${chaveData(new Date())}.json`)
    .catch(() => anunciar('Não foi possível salvar o backup.'));
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
  Calorias.iniciar();

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
  modalRegistro.addEventListener('close', () => { snapshotRegistro = null; });

  function tentarFecharRegistro() {
    confirmarFechamento(modalRegistro, registroMudou, salvarTreino,
      'Você tem alterações não salvas nesse treino.',
      () => preencherFormularioRegistro(chaveRegistroAberto, gruposPreRegistroAberto));
  }
  document.getElementById('btn-cancelar').addEventListener('click', tentarFecharRegistro);
  document.getElementById('fechar-modal').addEventListener('click', tentarFecharRegistro);
  modalRegistro.addEventListener('cancel', evento => {
    if (registroMudou()) {
      evento.preventDefault();
      tentarFecharRegistro();
    }
  });

  document.getElementById('btn-excluir').addEventListener('click', async () => {
    const chave = document.getElementById('reg-data').value;
    if ((await confirmarComMascote(`Excluir o treino de ${formatarData(chave)}?`)) !== 'principal') return;
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

  document.getElementById('btn-conta').addEventListener('click', () => {
    if (!Nuvem.configValido) {
      anunciar('Sincronização com a nuvem ainda não foi configurada.');
      return;
    }
    document.getElementById('conta-erro').hidden = true;
    modalConta.showModal();
  });
  function nomeMudou() {
    return usuarioLogado != null
      && document.getElementById('perfil-nome').value.trim() !== nomeOriginal;
  }
  function tentarFecharConta() {
    confirmarFechamento(modalConta, nomeMudou, () => salvarPerfilAgora(),
      'Seu nome foi alterado mas ainda não foi salvo.',
      () => { document.getElementById('perfil-nome').value = nomeOriginal; });
  }
  document.getElementById('fechar-conta').addEventListener('click', tentarFecharConta);
  modalConta.addEventListener('cancel', evento => {
    if (nomeMudou()) {
      evento.preventDefault();
      tentarFecharConta();
    }
  });

  document.getElementById('form-conta').addEventListener('submit', evento => {
    evento.preventDefault();
    const email = document.getElementById('conta-email').value.trim();
    const senha = document.getElementById('conta-senha').value;
    Nuvem.entrar(email, senha)
      .then(() => modalConta.close())
      .catch(e => mostrarErroConta(Nuvem.mensagemErro(e.code)));
  });

  document.getElementById('btn-cadastrar').addEventListener('click', () => {
    const email = document.getElementById('conta-email').value.trim();
    const senha = document.getElementById('conta-senha').value;
    if (!email || senha.length < 8) {
      mostrarErroConta('Preencha e-mail e uma senha com pelo menos 8 caracteres.');
      return;
    }
    Nuvem.cadastrar(email, senha)
      .then(() => modalConta.close())
      .catch(e => mostrarErroConta(Nuvem.mensagemErro(e.code)));
  });

  document.getElementById('btn-sair').addEventListener('click', () => {
    Nuvem.sair();
    modalConta.close();
  });

  document.getElementById('btn-trocar-foto')
    .addEventListener('click', () => document.getElementById('input-foto-perfil').click());

  document.getElementById('input-foto-perfil').addEventListener('change', evento => {
    const arquivo = evento.target.files[0];
    evento.target.value = '';
    if (!arquivo) return;
    const erro = document.getElementById('perfil-erro');
    erro.classList.remove('sucesso');
    erro.hidden = true;
    comprimirImagem(arquivo)
      .then(dataUrl => {
        perfilAtual.foto = dataUrl;
        document.getElementById('perfil-foto-preview').src = dataUrl;
        // Salva na hora — não depende do usuário lembrar de clicar em "Salvar perfil" depois.
        return Nuvem.salvarPerfil(perfilAtual);
      })
      .then(() => {
        erro.textContent = 'Foto salva.';
        erro.classList.add('sucesso');
        erro.hidden = false;
      })
      .catch(e => {
        console.error('Falha ao processar/salvar foto de perfil:', arquivo.type, arquivo.name, e);
        erro.classList.remove('sucesso');
        erro.textContent =
          `Não foi possível salvar essa foto. Tente outra ou tente de novo. (${arquivo.type || 'formato desconhecido'}: ${e.message || e})`;
        erro.hidden = false;
      });
  });

  function salvarPerfilAgora() {
    perfilAtual.nome = document.getElementById('perfil-nome').value.trim();
    const erro = document.getElementById('perfil-erro');
    erro.classList.remove('sucesso');
    erro.hidden = true;
    return Nuvem.salvarPerfil(perfilAtual)
      .then(() => {
        nomeOriginal = perfilAtual.nome;
        atualizarRotuloConta();
        anunciar('Perfil salvo.');
        erro.textContent = 'Perfil salvo.';
        erro.classList.add('sucesso');
        erro.hidden = false;
      })
      .catch(e => {
        console.error('Falha ao salvar perfil:', e);
        erro.textContent = 'Não foi possível salvar o perfil agora. Tente de novo.';
        erro.hidden = false;
        throw e;
      });
  }

  document.getElementById('btn-salvar-perfil').addEventListener('click', () => {
    salvarPerfilAgora().catch(() => {});
  });

  document.getElementById('btn-esqueci-senha').addEventListener('click', () => {
    const email = document.getElementById('conta-email').value.trim();
    document.getElementById('conta-erro').hidden = true;
    if (!email) {
      mostrarErroConta('Digite seu e-mail no campo acima primeiro.');
      return;
    }
    Nuvem.recuperarSenha(email)
      .then(() => anunciar('Enviamos um e-mail com instruções pra redefinir sua senha.'))
      .catch(e => mostrarErroConta(Nuvem.mensagemErro(e.code)));
  });

  document.getElementById('btn-alterar-senha').addEventListener('click', () => {
    const atual = document.getElementById('senha-atual').value;
    const nova = document.getElementById('senha-nova').value;
    const erro = document.getElementById('senha-erro');
    erro.hidden = true;
    if (!atual || nova.length < 8) {
      erro.textContent = 'Preencha a senha atual e uma nova senha com pelo menos 8 caracteres.';
      erro.hidden = false;
      return;
    }
    Nuvem.alterarSenha(atual, nova)
      .then(() => {
        document.getElementById('senha-atual').value = '';
        document.getElementById('senha-nova').value = '';
        anunciar('Senha alterada com sucesso.');
      })
      .catch(e => {
        erro.textContent = Nuvem.mensagemErro(e.code);
        erro.hidden = false;
      });
  });

  document.getElementById('btn-excluir-conta').addEventListener('click', async () => {
    const senha = document.getElementById('excluir-senha').value;
    const erro = document.getElementById('excluir-erro');
    erro.hidden = true;
    if (!senha) {
      erro.textContent = 'Digite sua senha pra confirmar.';
      erro.hidden = false;
      return;
    }
    if ((await confirmarComMascote('Excluir sua conta e os treinos salvos na nuvem? Essa ação não pode ser desfeita.')) !== 'principal') return;

    Nuvem.excluirConta(senha)
      .then(() => {
        modalConta.close();
        document.getElementById('excluir-senha').value = '';
        anunciar('Conta excluída.');
      })
      .catch(e => {
        erro.textContent = Nuvem.mensagemErro(e.code);
        erro.hidden = false;
      });
  });

  Nuvem.iniciar({ aoLogar, aoDeslogar });

  renderizarTudo();
}

document.addEventListener('DOMContentLoaded', iniciar);
