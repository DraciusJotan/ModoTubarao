const FOCOS = {
  'corpo-inteiro': ['pernas', 'peito', 'costas', 'ombros', 'core'],
  empurrar: ['peito', 'ombros', 'bracos'],
  puxar: ['costas', 'bracos'],
  pernas: ['pernas', 'core'],
  superior: ['peito', 'costas', 'ombros', 'bracos'],
  inferior: ['pernas', 'core']
};

const PARAMETROS = {
  hipertrofia: { series: 4, reps: '8-12', descanso: '60-90s', cardio: false },
  forca: { series: 5, reps: '3-6', descanso: '2-3 min', cardio: false, priorizarComposto: true },
  resistencia: { series: 3, reps: '15-20', descanso: '30-45s', cardio: false },
  emagrecimento: { series: 3, reps: '12-15', descanso: '30-45s', cardio: true }
};

const EXERCICIOS_POR_DURACAO = { 30: 4, 45: 5, 60: 6, 75: 8 };

const LIMITE_POR_GRUPO = { core: 2 };

const SUBGRUPO_POR_FOCO = { empurrar: 'triceps', puxar: 'biceps' };

const NIVEIS_PERMITIDOS = {
  iniciante: ['iniciante'],
  intermediario: ['iniciante', 'intermediario'],
  avancado: ['iniciante', 'intermediario', 'avancado']
};

// Dias de treino espalhados de forma equilibrada pela semana (com folga entre eles
// quando dá), pra dar nome de dia de verdade em vez de "Treino A/B/C".
const DIAS_SEMANA_POR_QTD = {
  2: ['Segunda-feira', 'Quinta-feira'],
  3: ['Segunda-feira', 'Quarta-feira', 'Sexta-feira'],
  4: ['Segunda-feira', 'Terça-feira', 'Quinta-feira', 'Sexta-feira'],
  5: ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'],
  6: ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
};

function montarDivisao(dias, nivel) {
  const divisao = construirDivisao(dias, nivel);
  const semana = DIAS_SEMANA_POR_QTD[dias] || DIAS_SEMANA_POR_QTD[6];
  return divisao.map((dia, indice) => ({ ...dia, nome: semana[indice] || dia.nome }));
}

function construirDivisao(dias, nivel) {
  if (dias === 2) {
    return [
      { nome: 'Treino A', foco: 'corpo-inteiro', titulo: 'Corpo inteiro' },
      { nome: 'Treino B', foco: 'corpo-inteiro', titulo: 'Corpo inteiro' }
    ];
  }
  if (dias === 3) {
    if (nivel === 'iniciante') {
      return ['A', 'B', 'C'].map(letra => ({
        nome: `Treino ${letra}`, foco: 'corpo-inteiro', titulo: 'Corpo inteiro'
      }));
    }
    return [
      { nome: 'Treino A', foco: 'empurrar', titulo: 'Empurrar — peito, ombros e tríceps' },
      { nome: 'Treino B', foco: 'puxar', titulo: 'Puxar — costas e bíceps' },
      { nome: 'Treino C', foco: 'pernas', titulo: 'Pernas e core' }
    ];
  }
  if (dias === 4) {
    return [
      { nome: 'Treino A', foco: 'superior', titulo: 'Superiores' },
      { nome: 'Treino B', foco: 'inferior', titulo: 'Inferiores e core' },
      { nome: 'Treino C', foco: 'superior', titulo: 'Superiores' },
      { nome: 'Treino D', foco: 'inferior', titulo: 'Inferiores e core' }
    ];
  }
  if (dias === 5) {
    return [
      { nome: 'Treino A', foco: 'empurrar', titulo: 'Empurrar — peito, ombros e tríceps' },
      { nome: 'Treino B', foco: 'puxar', titulo: 'Puxar — costas e bíceps' },
      { nome: 'Treino C', foco: 'pernas', titulo: 'Pernas e core' },
      { nome: 'Treino D', foco: 'superior', titulo: 'Superiores' },
      { nome: 'Treino E', foco: 'inferior', titulo: 'Inferiores e core' }
    ];
  }
  return [
    { nome: 'Treino A', foco: 'empurrar', titulo: 'Empurrar — peito, ombros e tríceps' },
    { nome: 'Treino B', foco: 'puxar', titulo: 'Puxar — costas e bíceps' },
    { nome: 'Treino C', foco: 'pernas', titulo: 'Pernas e core' },
    { nome: 'Treino D', foco: 'empurrar', titulo: 'Empurrar — variação' },
    { nome: 'Treino E', foco: 'puxar', titulo: 'Puxar — variação' },
    { nome: 'Treino F', foco: 'pernas', titulo: 'Pernas — variação' }
  ];
}

function embaralhar(lista) {
  const copia = lista.slice();
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function selecionarExercicios(foco, config, usados) {
  const gruposAlvo = FOCOS[foco];
  const niveis = NIVEIS_PERMITIDOS[config.nivel];
  const disponiveis = EXERCICIOS.filter(ex =>
    ex.grupo !== 'cardio' &&
    config.equipamento.includes(ex.equipamento) &&
    niveis.includes(ex.nivel)
  );

  const subgrupo = SUBGRUPO_POR_FOCO[foco];
  const porGrupo = {};
  gruposAlvo.forEach(g => {
    const doGrupo = embaralhar(disponiveis.filter(ex =>
      ex.grupo === g && !(g === 'bracos' && subgrupo && ex.subgrupo !== subgrupo)
    ));

    porGrupo[g] = doGrupo.sort((a, b) =>
      (a.tipo === 'composto' ? 0 : 1) - (b.tipo === 'composto' ? 0 : 1) ||
      (usados.has(a.id) ? 1 : 0) - (usados.has(b.id) ? 1 : 0)
    );
  });

  const escolhidos = [];
  const total = EXERCICIOS_POR_DURACAO[config.duracao];
  let volta = 0;

  while (escolhidos.length < total && volta < 12) {
    let adicionouNestaVolta = false;
    for (const grupo of gruposAlvo) {
      if (escolhidos.length >= total) break;

      if (LIMITE_POR_GRUPO[grupo] &&
          escolhidos.filter(e => e.grupo === grupo).length >= LIMITE_POR_GRUPO[grupo]) continue;
      const proximo = porGrupo[grupo].shift();
      if (proximo) {
        escolhidos.push(proximo);
        adicionouNestaVolta = true;
      }
    }
    if (!adicionouNestaVolta) break;
    volta++;
  }

  if (PARAMETROS[config.objetivo].priorizarComposto) {
    escolhidos.sort((a, b) => (a.tipo === 'composto' ? 0 : 1) - (b.tipo === 'composto' ? 0 : 1));
  }

  if (PARAMETROS[config.objetivo].cardio) {
    const cardios = EXERCICIOS.filter(ex =>
      ex.grupo === 'cardio' && config.equipamento.includes(ex.equipamento)
    );
    if (cardios.length) escolhidos.push(embaralhar(cardios)[0]);
  }

  return escolhidos;
}

function gerarTreino(config) {
  const divisao = montarDivisao(config.dias, config.nivel);
  const parametros = PARAMETROS[config.objetivo];
  const usados = new Set();

  return divisao.map(dia => {
    const selecionados = selecionarExercicios(dia.foco, config, usados);
    selecionados.forEach(ex => usados.add(ex.id));
    return {
      ...dia,
      exercicios: selecionados.map(ex => ({
        ex,
        series: ex.grupo === 'cardio' ? 1 : parametros.series,
        reps: ex.grupo === 'cardio' ? '10-15 min'
          : ex.isometrico ? '30-45s'
          : ex.grupo === 'core' ? '12-20'
          : parametros.reps,
        descanso: ex.grupo === 'cardio' ? '—' : parametros.descanso
      })),
      grupos: [...new Set(FOCOS[dia.foco])]
    };
  });
}

const Gerador = {
  iniciar(aoMarcarFeito) {
    const container = document.getElementById('grupo-equipamento');
    const padrao = ['peso-corporal', 'halteres', 'barra', 'maquina', 'cabo'];

    Object.entries(EQUIPAMENTOS).forEach(([valor, rotulo]) => {
      const label = document.createElement('label');
      label.className = 'opcao';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = 'equipamento';
      input.value = valor;
      input.checked = padrao.includes(valor);
      const span = document.createElement('span');
      span.textContent = rotulo;
      label.append(input, span);
      container.appendChild(label);
    });

    document.getElementById('form-gerador').addEventListener('submit', evento => {
      evento.preventDefault();
      Gerador.gerar(aoMarcarFeito);
    });

    document.getElementById('btn-imprimir').addEventListener('click', () => Gerador.exportarPDF());
  },

  gerar(aoMarcarFeito) {
    const equipamento = [...document.querySelectorAll('input[name="equipamento"]:checked')].map(i => i.value);
    const saida = document.getElementById('resultado-treino');

    if (!equipamento.length) {
      saida.textContent = '';
      const aviso = document.createElement('p');
      aviso.className = 'vazio';
      aviso.textContent = 'Selecione ao menos um tipo de equipamento disponível.';
      saida.appendChild(aviso);
      return;
    }

    const config = {
      objetivo: document.querySelector('input[name="objetivo"]:checked').value,
      nivel: document.getElementById('gen-nivel').value,
      dias: Number(document.getElementById('gen-dias').value),
      duracao: Number(document.getElementById('gen-duracao').value),
      equipamento
    };

    const treino = gerarTreino(config);
    Gerador.ultimoTreino = treino;
    Gerador.ultimoConfig = config;
    Gerador.renderizar(treino, config, aoMarcarFeito);
    document.getElementById('btn-imprimir').hidden = false;
    saida.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  exportarPDF() {
    const treino = Gerador.ultimoTreino;
    const config = Gerador.ultimoConfig;
    if (!treino || !window.jspdf) return;

    const rotulosObjetivo = {
      hipertrofia: 'Hipertrofia', forca: 'Força',
      resistencia: 'Resistência', emagrecimento: 'Emagrecimento'
    };
    const parametros = PARAMETROS[config.objetivo];

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margemX = 40;
    const larguraUtil = doc.internal.pageSize.getWidth() - margemX * 2;
    const alturaPagina = doc.internal.pageSize.getHeight();
    let y = 54;

    function novaLinhaSeNecessario(espacoNecessario) {
      if (y + espacoNecessario > alturaPagina - 40) {
        doc.addPage();
        y = 54;
      }
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.text('SharkFit — Plano de treino', margemX, y);
    y += 22;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(
      `Objetivo: ${rotulosObjetivo[config.objetivo]}   ·   Nível: ${NIVEIS[config.nivel]}   ·   Repetições: ${parametros.reps}   ·   Descanso: ${parametros.descanso}   ·   Sessão: ~${config.duracao} min`,
      margemX, y, { maxWidth: larguraUtil }
    );
    y += 26;

    treino.forEach(dia => {
      novaLinhaSeNecessario(60);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(`${dia.nome} — ${dia.titulo}`, margemX, y);
      y += 16;

      doc.setFontSize(9.5);
      doc.setTextColor(90);
      doc.text('Exercício', margemX, y);
      doc.text('Séries', margemX + 260, y);
      doc.text('Reps', margemX + 330, y);
      doc.text('Descanso', margemX + 400, y);
      doc.setTextColor(0);
      y += 4;
      doc.setDrawColor(200);
      doc.line(margemX, y, margemX + larguraUtil, y);
      y += 14;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      dia.exercicios.forEach(item => {
        novaLinhaSeNecessario(18);
        doc.text(item.ex.nome, margemX, y, { maxWidth: 245 });
        doc.text(String(item.series), margemX + 260, y);
        doc.text(String(item.reps), margemX + 330, y);
        doc.text(String(item.descanso), margemX + 400, y);
        y += 17;
      });
      y += 14;
    });

    const blob = doc.output('blob');
    Exportar.salvar(blob, `sharkfit-treino-${chaveData(new Date())}.pdf`)
      .catch(() => anunciar('Não foi possível salvar o PDF.'));
  },

  renderizar(treino, config, aoMarcarFeito) {
    const saida = document.getElementById('resultado-treino');
    saida.textContent = '';

    const rotulosObjetivo = {
      hipertrofia: 'Hipertrofia', forca: 'Força',
      resistencia: 'Resistência', emagrecimento: 'Emagrecimento'
    };
    const parametros = PARAMETROS[config.objetivo];

    const resumo = document.createElement('section');
    resumo.className = 'resumo-treino';
    const h2 = document.createElement('h2');
    h2.textContent = `Seu plano de ${config.dias} dias`;
    const p = document.createElement('p');
    p.className = 'bloco-sub';
    p.style.marginBottom = '0';
    p.textContent = 'Clique no nome de qualquer exercício para ver a execução passo a passo.';
    resumo.append(h2, p);

    const linha = document.createElement('div');
    linha.className = 'resumo-linha';
    [
      ['Objetivo', rotulosObjetivo[config.objetivo]],
      ['Nível', NIVEIS[config.nivel]],
      ['Repetições', parametros.reps],
      ['Descanso', parametros.descanso],
      ['Sessão', `~${config.duracao} min`]
    ].forEach(([rotulo, valor]) => {
      const item = document.createElement('div');
      item.className = 'resumo-item';
      const forte = document.createElement('strong');
      forte.textContent = valor;
      item.append(forte, document.createTextNode(rotulo));
      linha.appendChild(item);
    });
    resumo.appendChild(linha);
    saida.appendChild(resumo);

    treino.forEach(dia => saida.appendChild(Gerador.cartaoDia(dia, aoMarcarFeito)));
  },

  cartaoDia(dia, aoMarcarFeito) {
    const secao = document.createElement('section');
    secao.className = 'dia-treino';

    const topo = document.createElement('div');
    topo.className = 'dia-topo';
    const info = document.createElement('div');
    const nome = document.createElement('div');
    nome.className = 'dia-nome';
    nome.textContent = dia.nome;
    const foco = document.createElement('div');
    foco.className = 'dia-foco';
    foco.textContent = dia.titulo;
    info.append(nome, foco);

    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'btn btn-secundario btn-pequeno';
    botao.textContent = 'Fiz este treino hoje';
    botao.addEventListener('click', () => aoMarcarFeito(dia));

    topo.append(info, botao);
    secao.appendChild(topo);

    const wrap = document.createElement('div');
    wrap.className = 'tabela-wrap';
    const tabela = document.createElement('table');
    tabela.className = 'exercicios';

    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    ['Exercício', 'Séries', 'Reps', 'Descanso'].forEach(texto => {
      const th = document.createElement('th');
      th.scope = 'col';
      th.textContent = texto;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    const tbody = document.createElement('tbody');
    dia.exercicios.forEach(item => {
      const tr = document.createElement('tr');

      const tdNome = document.createElement('td');
      const link = document.createElement('button');
      link.type = 'button';
      link.className = 'link-exercicio';
      link.textContent = item.ex.nome;
      link.addEventListener('click', () => Biblioteca.abrirDetalhe(item.ex.id));
      tdNome.appendChild(link);

      const tdSeries = document.createElement('td');
      tdSeries.className = 'col-num';
      tdSeries.textContent = item.series;

      const tdReps = document.createElement('td');
      tdReps.className = 'col-num';
      tdReps.textContent = item.reps;

      const tdDescanso = document.createElement('td');
      tdDescanso.className = 'col-num';
      tdDescanso.textContent = item.descanso;

      tr.append(tdNome, tdSeries, tdReps, tdDescanso);
      tbody.appendChild(tr);
    });

    tabela.append(thead, tbody);
    wrap.appendChild(tabela);
    secao.appendChild(wrap);
    return secao;
  }
};
