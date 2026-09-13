const CELULA = 13;
const ESPACO = 3;
const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function diasDoPeriodo() {
  const hoje = new Date();
  const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const inicioBruto = new Date(fim);
  inicioBruto.setDate(inicioBruto.getDate() - 364);
  const inicio = inicioDaSemana(inicioBruto);

  const dias = [];
  const cursor = new Date(inicio);
  while (cursor <= fim) {
    dias.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  while (dias.length % 7 !== 0) {
    const ultimo = dias[dias.length - 1];
    const proximo = new Date(ultimo);
    proximo.setDate(proximo.getDate() + 1);
    dias.push(proximo);
  }
  return { dias, fim };
}

function nivelDoTreino(treino) {
  if (!treino) return 0;
  return Math.min(4, Math.max(1, Number(treino.intensidade) || 2));
}

function renderizarHeatmap(treinos, aoClicarDia) {
  const grade = document.getElementById('heatmap-grid');
  const faixaMeses = document.getElementById('heatmap-meses');
  const { dias, fim } = diasDoPeriodo();
  const hojeChave = chaveData(fim);

  grade.textContent = '';
  faixaMeses.textContent = '';

  const semanas = dias.length / 7;
  faixaMeses.style.gridAutoFlow = 'row';
  faixaMeses.style.gridTemplateColumns = `repeat(${semanas}, ${CELULA}px)`;

  let mesAnterior = -1;
  for (let semana = 0; semana < semanas; semana++) {
    const primeiroDia = dias[semana * 7];
    if (primeiroDia.getMonth() !== mesAnterior) {
      mesAnterior = primeiroDia.getMonth();
      const rotulo = document.createElement('span');
      rotulo.textContent = MESES_CURTOS[mesAnterior];
      rotulo.style.gridColumn = `${semana + 1} / span 4`;
      rotulo.style.whiteSpace = 'nowrap';
      faixaMeses.appendChild(rotulo);
    }
  }

  const celulas = [];
  dias.forEach(dia => {
    const chave = chaveData(dia);
    const futuro = dia > fim;
    const treino = treinos[chave];
    const nivel = nivelDoTreino(treino);

    const celula = document.createElement('button');
    celula.type = 'button';
    celula.className = `celula nivel-${nivel}` + (futuro ? ' vazia' : '') + (chave === hojeChave ? ' hoje' : '');
    celula.setAttribute('role', 'gridcell');
    celula.dataset.data = chave;
    celula.tabIndex = -1;

    if (futuro) {
      celula.setAttribute('aria-hidden', 'true');
      celula.disabled = true;
    } else {
      const descricao = treino
        ? `${(treino.grupos || []).map(g => GRUPOS[g]).join(', ') || 'treino'} — ${treino.duracao || 0} min`
        : 'sem treino';
      celula.setAttribute('aria-label', `${formatarData(chave)}: ${descricao}`);
      celula.title = `${formatarData(chave)} — ${descricao}`;
      celula.addEventListener('click', () => aoClicarDia(chave));
      celulas.push(celula);
    }

    grade.appendChild(celula);
  });

  const ultima = celulas[celulas.length - 1];
  if (ultima) ultima.tabIndex = 0;

  grade.addEventListener('keydown', evento => {
    const atual = document.activeElement;
    if (!atual || !atual.classList.contains('celula')) return;
    const indice = celulas.indexOf(atual);
    if (indice === -1) return;

    const passos = { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -7, ArrowRight: 7 };
    let destino = null;

    if (evento.key in passos) destino = indice + passos[evento.key];
    else if (evento.key === 'Home') destino = 0;
    else if (evento.key === 'End') destino = celulas.length - 1;
    else return;

    evento.preventDefault();
    destino = Math.max(0, Math.min(celulas.length - 1, destino));
    atual.tabIndex = -1;
    celulas[destino].tabIndex = 0;
    celulas[destino].focus();
  });

  const rolagem = document.getElementById('heatmap-scroll');
  rolagem.scrollLeft = rolagem.scrollWidth;

  const totalPeriodo = dias.filter(d => d <= fim && treinos[chaveData(d)]).length;
  document.getElementById('heatmap-resumo').textContent =
    `${totalPeriodo} ${totalPeriodo === 1 ? 'treino registrado' : 'treinos registrados'} nos últimos 12 meses`;
}

const ROTULOS_INTENSIDADE = ['Leve', 'Moderado', 'Intenso', 'Máximo'];

const CARTAZ = {
  fundo: '#101a2c',
  painel: '#18233c',
  traco: '#33456a',
  texto: '#f2f6fb',
  fraco: '#93a7c4',
  ouro: '#fbc54b',
  niveis: ['#1e2b45', '#25547a', '#3583b5', '#4cb6e3', '#8fd8f5']
};

function formatarDuracao(minutos) {
  const horas = Math.round(minutos / 60);
  return horas >= 1 ? `${horas} h` : `${minutos} min`;
}

async function exportarImagem(treinos, estatisticas) {
  const { dias, fim } = diasDoPeriodo();
  const semanas = dias.length / 7;
  const escala = 2;
  const margem = 40;
  const estilo = getComputedStyle(document.documentElement);
  const fonte = estilo.getPropertyValue('--fonte').trim() || 'sans-serif';
  const display = estilo.getPropertyValue('--fonte-display').trim() || 'Impact, sans-serif';

  const mascote = new Image();
  // Data URI de propósito: PNG lido de arquivo contamina o canvas e quebra a exportação em file://.
  mascote.src = MASCOTE_EXPORTACAO;

  // Prazo máximo: em aba oculta essas promessas podem nunca se resolver.
  await Promise.race([
    Promise.all([mascote.decode().catch(() => {}), document.fonts.ready]),
    new Promise(resolve => setTimeout(resolve, 2000))
  ]);

  const larguraGrade = semanas * (CELULA + ESPACO) - ESPACO;
  const alturaGrade = 7 * (CELULA + ESPACO) - ESPACO;
  const largura = larguraGrade + margem * 2;

  const gruposTreinados = Object.entries(estatisticas.porGrupo)
    .filter(([, qtd]) => qtd > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const topRecordes = Object.values(calcularRecordes(treinos))
    .sort((a, b) => b.rm - a.rm)
    .slice(0, 3);

  const alturaColunas = 48 + Math.max(gruposTreinados.length, ROTULOS_INTENSIDADE.length) * 26;
  const alturaRecordes = topRecordes.length ? 38 + topRecordes.length * 28 : 0;
  const altura = 148 + 122 + 30 + alturaGrade + 40 + alturaColunas + alturaRecordes + 54;

  const canvas = document.createElement('canvas');
  canvas.width = largura * escala;
  canvas.height = altura * escala;
  const ctx = canvas.getContext('2d');
  ctx.scale(escala, escala);

  function caixa(x, y, w, h, raio, preenchimento, contorno, espessura = 2) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, raio);
    if (preenchimento) { ctx.fillStyle = preenchimento; ctx.fill(); }
    if (contorno) { ctx.strokeStyle = contorno; ctx.lineWidth = espessura; ctx.stroke(); }
  }

  function texto(conteudo, x, y, opcoes = {}) {
    const {
      tamanho = 13, peso = '400', cor = CARTAZ.texto,
      alinhamento = 'left', caixaAlta = false, espacamento = 0
    } = opcoes;
    ctx.font = `${peso} ${tamanho}px ${opcoes.display ? display : fonte}`;
    ctx.fillStyle = cor;
    ctx.textAlign = alinhamento;
    ctx.letterSpacing = `${espacamento}px`;
    ctx.fillText(caixaAlta ? conteudo.toUpperCase() : conteudo, x, y);
    ctx.letterSpacing = '0px';
    ctx.textAlign = 'left';
  }

  function microRotulo(conteudo, x, y, cor = CARTAZ.fraco, alinhamento = 'left') {
    texto(conteudo, x, y, { tamanho: 10, peso: '700', cor, caixaAlta: true, espacamento: 1.6, alinhamento });
  }

  function tituloSecao(conteudo, x, y, largura) {
    microRotulo(conteudo, x, y);
    ctx.fillStyle = CARTAZ.traco;
    ctx.fillRect(x, y + 8, largura, 1);
  }

  function barra(x, y, larguraTotal, fracao, cor) {
    caixa(x, y, larguraTotal, 9, 1, CARTAZ.painel);
    if (fracao > 0) caixa(x, y, Math.max(7, larguraTotal * fracao), 9, 1, cor);
  }

  ctx.fillStyle = CARTAZ.fundo;
  ctx.fillRect(0, 0, largura, altura);

  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,.028)';
  ctx.lineWidth = 12;
  for (let x = -altura; x < largura + altura; x += 34) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + altura, altura);
    ctx.stroke();
  }
  ctx.restore();

  let y = 62;
  texto('SHARKFIT', margem, y, { tamanho: 44, display: true });
  ctx.fillStyle = CARTAZ.ouro;
  ctx.fillRect(margem, y + 14, 132, 5);
  microRotulo(`Últimos 12 meses · ${formatarData(chaveData(new Date()))}`, margem, y + 42);

  if (mascote.complete && mascote.naturalWidth) {
    const alturaMascote = 118;
    const larguraMascote = mascote.naturalWidth * (alturaMascote / mascote.naturalHeight);
    ctx.drawImage(mascote, largura - margem - larguraMascote, 14, larguraMascote, alturaMascote);
  }

  y = 148;
  const larguraPlacar = 236;
  caixa(margem, y, larguraPlacar, 108, 3, CARTAZ.painel, CARTAZ.ouro, 3);
  texto(String(estatisticas.sequenciaAtual), margem + 20, y + 68, { tamanho: 62, cor: CARTAZ.ouro, display: true });
  microRotulo('semanas seguidas na meta', margem + 20, y + 90);

  const apoio = [
    [String(estatisticas.total), 'treinos registrados'],
    [`${Math.round(estatisticas.volume).toLocaleString('pt-BR')} kg`, 'volume levantado'],
    [formatarDuracao(estatisticas.minutos), 'tempo de treino']
  ];
  const xApoio = margem + larguraPlacar + 34;
  apoio.forEach(([valor, rotulo], i) => {
    const linhaY = y + 26 + i * 36;
    texto(valor, xApoio, linhaY, { tamanho: 27, display: true });

    ctx.font = `400 27px ${display}`;
    microRotulo(rotulo, xApoio + ctx.measureText(valor).width + 14, linhaY - 2);
    if (i < apoio.length - 1) {
      ctx.fillStyle = CARTAZ.traco;
      ctx.fillRect(xApoio, linhaY + 12, largura - xApoio - margem, 1);
    }
  });

  y += 138;
  let mesAnteriorGrade = -1;
  for (let semana = 0; semana < semanas; semana++) {
    const primeiroDia = dias[semana * 7];
    if (primeiroDia.getMonth() !== mesAnteriorGrade) {
      mesAnteriorGrade = primeiroDia.getMonth();
      microRotulo(MESES_CURTOS[mesAnteriorGrade], margem + semana * (CELULA + ESPACO), y);
    }
  }

  const topoGrade = y + 10;
  dias.forEach((dia, indice) => {
    if (dia > fim) return;
    const x = margem + Math.floor(indice / 7) * (CELULA + ESPACO);
    caixa(x, topoGrade + (indice % 7) * (CELULA + ESPACO), CELULA - 1, CELULA - 1, 1,
      CARTAZ.niveis[nivelDoTreino(treinos[chaveData(dia)])]);
  });

  y = topoGrade + alturaGrade + 24;
  microRotulo('menos', margem, y);
  CARTAZ.niveis.forEach((cor, i) => {
    caixa(margem + 46 + i * (CELULA + ESPACO), y - 10, CELULA - 1, CELULA - 1, 1, cor);
  });
  microRotulo('mais', margem + 46 + 5 * (CELULA + ESPACO) + 6, y);

  y += 34;
  const larguraColuna = (largura - margem * 2 - 44) / 2;
  const xColunaB = margem + larguraColuna + 44;

  if (gruposTreinados.length) {
    tituloSecao('O que você treinou', margem, y, larguraColuna);
    const maximo = Math.max(...gruposTreinados.map(([, qtd]) => qtd));
    gruposTreinados.forEach(([grupo, qtd], i) => {
      const linhaY = y + 30 + i * 26;
      texto(GRUPOS[grupo], margem, linhaY + 8, { tamanho: 12, peso: '600' });

      barra(margem + 84, linhaY + 1, larguraColuna - 84 - 44, qtd / maximo,
        i === 0 ? CARTAZ.ouro : CARTAZ.niveis[3]);
      texto(`${qtd}x`, margem + larguraColuna, linhaY + 8,
        { tamanho: 11, cor: CARTAZ.fraco, alinhamento: 'right' });
    });
  }

  tituloSecao('Intensidade das sessões', xColunaB, y, larguraColuna);
  const maxIntensidade = Math.max(1, ...estatisticas.porIntensidade);
  ROTULOS_INTENSIDADE.forEach((rotulo, i) => {
    const linhaY = y + 30 + i * 26;
    const qtd = estatisticas.porIntensidade[i] || 0;
    texto(rotulo, xColunaB, linhaY + 8, { tamanho: 12, peso: '600' });
    barra(xColunaB + 84, linhaY + 1, larguraColuna - 84 - 44, qtd / maxIntensidade, CARTAZ.niveis[i + 1]);
    texto(`${qtd}x`, xColunaB + larguraColuna, linhaY + 8,
      { tamanho: 11, cor: CARTAZ.fraco, alinhamento: 'right' });
  });

  y += alturaColunas;

  if (topRecordes.length) {
    tituloSecao('Recordes pessoais', margem, y, largura - margem * 2);
    topRecordes.forEach((pr, i) => {
      const linhaY = y + 20 + i * 28;
      caixa(margem, linhaY, largura - margem * 2, 24, 1, CARTAZ.painel);
      ctx.fillStyle = CARTAZ.ouro;
      ctx.fillRect(margem, linhaY, 4, 24);
      texto(pr.nome, margem + 16, linhaY + 17, { tamanho: 12, peso: '700' });
      texto(`${pr.peso} kg × ${pr.reps} reps`, margem + largura / 2 - 40, linhaY + 17,
        { tamanho: 11, cor: CARTAZ.fraco });
      texto(`1RM ${pr.rm.toFixed(0)} KG`, largura - margem - 14, linhaY + 18,
        { tamanho: 16, cor: CARTAZ.ouro, alinhamento: 'right', display: true });
    });
    y += alturaRecordes;
  }

  ctx.fillStyle = CARTAZ.traco;
  ctx.fillRect(margem, altura - 40, largura - margem * 2, 1);
  microRotulo('sharkfit · seu treino em um gráfico', margem, altura - 20, CARTAZ.texto);
  microRotulo(chaveData(new Date()), largura - margem, altura - 20, CARTAZ.fraco, 'right');

  canvas.toBlob(blob => {
    Exportar.salvar(blob, `sharkfit-${chaveData(new Date())}.png`)
      .catch(() => anunciar('Não foi possível salvar a imagem.'));
  }, 'image/png');
}
