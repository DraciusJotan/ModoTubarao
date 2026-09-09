const Biblioteca = {
  iniciar() {
    preencherSelect('filtro-grupo', GRUPOS);
    preencherSelect('filtro-equipamento', EQUIPAMENTOS);
    preencherSelect('filtro-nivel', NIVEIS);

    ['busca-exercicio', 'filtro-grupo', 'filtro-equipamento', 'filtro-nivel'].forEach(id => {
      const campo = document.getElementById(id);
      campo.addEventListener('input', () => Biblioteca.renderizar());
    });

    document.getElementById('fechar-exercicio')
      .addEventListener('click', () => document.getElementById('modal-exercicio').close());

    Biblioteca.renderizar();
  },

  filtrar() {
    const busca = document.getElementById('busca-exercicio').value.trim().toLowerCase();
    const grupo = document.getElementById('filtro-grupo').value;
    const equipamento = document.getElementById('filtro-equipamento').value;
    const nivel = document.getElementById('filtro-nivel').value;

    return EXERCICIOS.filter(ex => {
      if (grupo && ex.grupo !== grupo) return false;
      if (equipamento && ex.equipamento !== equipamento) return false;
      if (nivel && ex.nivel !== nivel) return false;
      if (busca) {
        const alvo = `${ex.nome} ${ex.musculos} ${GRUPOS[ex.grupo]}`.toLowerCase();
        if (!alvo.includes(busca)) return false;
      }
      return true;
    });
  },

  renderizar() {
    const grade = document.getElementById('grade-exercicios');
    const contagem = document.getElementById('contagem-exercicios');
    const lista = Biblioteca.filtrar();

    contagem.textContent = lista.length === 0
      ? 'Nenhum exercício encontrado com esses filtros.'
      : `${lista.length} ${lista.length === 1 ? 'exercício encontrado' : 'exercícios encontrados'}`;

    grade.textContent = '';
    lista.forEach(ex => grade.appendChild(Biblioteca.cartao(ex)));
  },

  cartao(ex) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'cartao-exercicio';
    botao.addEventListener('click', () => Biblioteca.abrirDetalhe(ex.id));

    const titulo = document.createElement('span');
    titulo.className = 'cartao-titulo';
    titulo.textContent = ex.nome;

    const musculos = document.createElement('span');
    musculos.className = 'cartao-musculos';
    musculos.textContent = ex.musculos;

    const tags = document.createElement('span');
    tags.className = 'cartao-tags';
    tags.appendChild(criarTag(GRUPOS[ex.grupo], 'tag-grupo'));
    tags.appendChild(criarTag(EQUIPAMENTOS[ex.equipamento]));
    tags.appendChild(criarTag(NIVEIS[ex.nivel]));

    botao.append(titulo, musculos, tags);
    return botao;
  },

  abrirDetalhe(id) {
    const ex = EXERCICIOS.find(e => e.id === id);
    if (!ex) return;

    document.getElementById('titulo-exercicio').textContent = ex.nome;
    const corpo = document.getElementById('corpo-exercicio');
    corpo.textContent = '';

    const tags = document.createElement('div');
    tags.className = 'cartao-tags';
    tags.style.marginBottom = '1rem';
    tags.appendChild(criarTag(GRUPOS[ex.grupo], 'tag-grupo'));
    tags.appendChild(criarTag(EQUIPAMENTOS[ex.equipamento]));
    tags.appendChild(criarTag(NIVEIS[ex.nivel]));
    tags.appendChild(criarTag(ex.tipo === 'composto' ? 'Composto' : ex.tipo === 'cardio' ? 'Cardio' : 'Isolado'));
    corpo.appendChild(tags);

    corpo.appendChild(secaoDetalhe('Músculos trabalhados', [ex.musculos], 'ul'));
    corpo.appendChild(secaoDetalhe('Como executar', ex.passos, 'ol'));
    corpo.appendChild(secaoDetalhe('Dicas', ex.dicas, 'ul'));
    corpo.appendChild(secaoDetalhe('Erros comuns', ex.erros, 'ul', 'lista-erros'));

    document.getElementById('modal-exercicio').showModal();
  }
};

function secaoDetalhe(titulo, itens, tipoLista, classe) {
  const secao = document.createElement('section');
  secao.className = 'detalhe-secao';

  const h3 = document.createElement('h3');
  h3.textContent = titulo;
  secao.appendChild(h3);

  const lista = document.createElement(tipoLista);
  if (classe) lista.className = classe;
  itens.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    lista.appendChild(li);
  });
  secao.appendChild(lista);
  return secao;
}

function criarTag(texto, classeExtra) {
  const span = document.createElement('span');
  span.className = 'tag' + (classeExtra ? ' ' + classeExtra : '');
  span.textContent = texto;
  return span;
}

function preencherSelect(id, mapa) {
  const select = document.getElementById(id);
  Object.entries(mapa).forEach(([valor, rotulo]) => {
    const opcao = document.createElement('option');
    opcao.value = valor;
    opcao.textContent = rotulo;
    select.appendChild(opcao);
  });
}
