const REFEICOES = [
  { chave: 'cafe', rotulo: 'Café da manhã' },
  { chave: 'almoco', rotulo: 'Almoço' },
  { chave: 'lanche', rotulo: 'Lanche da tarde' },
  { chave: 'jantar', rotulo: 'Jantar' },
  { chave: 'ceia', rotulo: 'Ceia' }
];

const Calorias = (() => {
  let dataAtual = chaveData(new Date());

  function formatarQuantidade(q) {
    return Number.isInteger(q) ? String(q) : String(Math.round(q * 100) / 100);
  }

  function buscarAlimento(nome) {
    const alvo = nome.trim().toLowerCase();
    return ALIMENTOS.find(a => a.nome.toLowerCase() === alvo);
  }

  function itensDoDia() {
    return estado.alimentacao[dataAtual] || [];
  }

  function totalCalorias(itens) {
    return itens.reduce((soma, item) => soma + item.calorias * item.quantidade, 0);
  }

  function adicionarItem(refeicao, item) {
    if (!estado.alimentacao[dataAtual]) estado.alimentacao[dataAtual] = [];
    estado.alimentacao[dataAtual].push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      refeicao,
      ...item
    });
    Dados.salvar(estado);
    renderizar();
    anunciar(`${item.nome} adicionado.`);
  }

  function removerItem(id) {
    const restantes = itensDoDia().filter(i => i.id !== id);
    if (restantes.length) estado.alimentacao[dataAtual] = restantes;
    else delete estado.alimentacao[dataAtual];
    Dados.salvar(estado);
    renderizar();
    anunciar('Item removido.');
  }

  function mudarData(delta) {
    const data = dataDeChave(dataAtual);
    data.setDate(data.getDate() + delta);
    dataAtual = chaveData(data);
    renderizar();
  }

  function linhaItem(item) {
    const li = document.createElement('li');
    li.className = 'cal-item';

    const info = document.createElement('div');
    const nome = document.createElement('div');
    nome.className = 'cal-item-nome';
    nome.textContent = item.nome;
    const porcao = document.createElement('div');
    porcao.className = 'cal-item-porcao';
    porcao.textContent = `${formatarQuantidade(item.quantidade)} × ${item.porcao}`;
    info.append(nome, porcao);

    const kcal = document.createElement('div');
    kcal.className = 'cal-item-kcal';
    kcal.textContent = `${Math.round(item.calorias * item.quantidade)} kcal`;

    const remover = document.createElement('button');
    remover.type = 'button';
    remover.className = 'btn-remover';
    remover.textContent = '✕';
    remover.setAttribute('aria-label', `Remover ${item.nome}`);
    remover.addEventListener('click', () => removerItem(item.id));

    li.append(info, kcal, remover);
    return li;
  }

  function linhaAdicionar(chaveRefeicao) {
    const linha = document.createElement('div');
    linha.className = 'cal-add-linha';

    const nome = document.createElement('input');
    nome.type = 'text';
    nome.placeholder = 'Alimento';
    nome.setAttribute('list', 'lista-alimentos');
    nome.setAttribute('aria-label', 'Nome do alimento');
    nome.className = 'cal-add-nome';

    const qtd = document.createElement('input');
    qtd.type = 'number';
    qtd.min = '0.25';
    qtd.step = '0.25';
    qtd.value = '1';
    qtd.className = 'cal-add-qtd';
    qtd.setAttribute('aria-label', 'Quantas porções');

    const porcaoTexto = document.createElement('span');
    porcaoTexto.className = 'cal-add-porcao';

    const kcalInput = document.createElement('input');
    kcalInput.type = 'number';
    kcalInput.min = '0';
    kcalInput.placeholder = 'kcal/porção';
    kcalInput.className = 'cal-add-kcal';
    kcalInput.setAttribute('aria-label', 'Calorias por porção');

    let porcaoAtual = 'porção';

    nome.addEventListener('input', () => {
      const alimento = buscarAlimento(nome.value);
      if (alimento) {
        kcalInput.value = alimento.calorias;
        porcaoTexto.textContent = alimento.porcao;
        porcaoAtual = alimento.porcao;
      } else {
        porcaoTexto.textContent = '';
        porcaoAtual = 'porção';
      }
    });

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-secundario btn-pequeno';
    btn.textContent = '+ Adicionar';
    btn.addEventListener('click', () => {
      const nomeVal = nome.value.trim();
      const qtdVal = Number(qtd.value) || 1;
      const kcalVal = Number(kcalInput.value);
      if (!nomeVal || !kcalVal) {
        anunciar('Preencha o alimento e as calorias por porção.');
        return;
      }
      adicionarItem(chaveRefeicao, { nome: nomeVal, quantidade: qtdVal, calorias: kcalVal, porcao: porcaoAtual });
      nome.value = '';
      qtd.value = '1';
      kcalInput.value = '';
      porcaoTexto.textContent = '';
      porcaoAtual = 'porção';
      nome.focus();
    });

    linha.append(nome, qtd, porcaoTexto, kcalInput, btn);
    return linha;
  }

  function blocoRefeicao(refeicao) {
    const itens = itensDoDia().filter(i => i.refeicao === refeicao.chave);
    const secao = document.createElement('section');
    secao.className = 'bloco cal-refeicao';

    const topo = document.createElement('div');
    topo.className = 'bloco-topo';
    const titulo = document.createElement('h3');
    titulo.textContent = refeicao.rotulo;
    const subtotal = document.createElement('strong');
    subtotal.className = 'cal-subtotal';
    subtotal.textContent = `${Math.round(totalCalorias(itens))} kcal`;
    topo.append(titulo, subtotal);
    secao.appendChild(topo);

    if (itens.length) {
      const lista = document.createElement('ul');
      lista.className = 'cal-lista';
      itens.forEach(item => lista.appendChild(linhaItem(item)));
      secao.appendChild(lista);
    } else {
      const vazio = document.createElement('p');
      vazio.className = 'vazio';
      vazio.textContent = 'Nada registrado ainda.';
      secao.appendChild(vazio);
    }

    secao.appendChild(linhaAdicionar(refeicao.chave));
    return secao;
  }

  function renderizar() {
    const dataInput = document.getElementById('cal-data');
    const legenda = document.getElementById('cal-data-legenda');
    const metaInput = document.getElementById('cal-meta');
    const resumo = document.getElementById('cal-resumo');
    const container = document.getElementById('cal-refeicoes');
    if (!dataInput || !container) return;

    const itens = itensDoDia();
    const total = totalCalorias(itens);
    const meta = estado.metaCalorica || 2000;

    dataInput.value = dataAtual;
    legenda.textContent = dataAtual === chaveData(new Date()) ? 'Hoje' : formatarData(dataAtual);
    metaInput.value = meta;

    resumo.textContent = '';
    [
      ['Consumido', `${Math.round(total)} kcal`],
      ['Meta diária', `${meta} kcal`],
      ['Restante', `${Math.round(Math.max(0, meta - total))} kcal`]
    ].forEach(([rotulo, valor]) => {
      const cartao = document.createElement('article');
      cartao.className = 'cartao-stat';
      const span = document.createElement('span');
      span.className = 'stat-rotulo';
      span.textContent = rotulo;
      const forte = document.createElement('strong');
      forte.className = 'stat-valor';
      forte.textContent = valor;
      cartao.append(span, forte);
      resumo.appendChild(cartao);
    });

    container.textContent = '';
    REFEICOES.forEach(r => container.appendChild(blocoRefeicao(r)));
  }

  function iniciar() {
    const datalist = document.createElement('datalist');
    datalist.id = 'lista-alimentos';
    ALIMENTOS.forEach(a => {
      const opcao = document.createElement('option');
      opcao.value = a.nome;
      datalist.appendChild(opcao);
    });
    document.body.appendChild(datalist);

    document.getElementById('cal-data').addEventListener('change', evento => {
      dataAtual = evento.target.value || chaveData(new Date());
      renderizar();
    });
    document.getElementById('cal-dia-anterior').addEventListener('click', () => mudarData(-1));
    document.getElementById('cal-dia-seguinte').addEventListener('click', () => mudarData(1));
    document.getElementById('cal-meta').addEventListener('change', evento => {
      estado.metaCalorica = Number(evento.target.value) || 2000;
      Dados.salvar(estado);
      renderizar();
    });

    renderizar();
  }

  return { iniciar, renderizar };
})();
