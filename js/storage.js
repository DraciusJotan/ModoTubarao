// Renomear esta chave descarta os treinos de quem já usa o site.
const CHAVE = 'gymgraph:v1';

const Dados = {
  padrao() {
    return { versao: 1, metaSemanal: 3, tema: 'claro', treinos: {} };
  },

  carregar() {
    try {
      const bruto = localStorage.getItem(CHAVE);
      if (!bruto) return Dados.padrao();
      const dados = JSON.parse(bruto);
      return Object.assign(Dados.padrao(), dados);
    } catch (e) {
      console.warn('Não foi possível ler os dados salvos:', e);
      return Dados.padrao();
    }
  },

  salvar(dados) {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(dados));
      return true;
    } catch (e) {
      console.warn('Não foi possível salvar:', e);
      return false;
    }
  }
};

function chaveData(d) {
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function dataDeChave(chave) {
  const [a, m, d] = chave.split('-').map(Number);
  return new Date(a, m - 1, d);
}

function formatarData(chave) {
  return dataDeChave(chave).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
}

function formatarDataCurta(chave) {
  return dataDeChave(chave).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function inicioDaSemana(d) {
  const data = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diaSemana = (data.getDay() + 6) % 7;
  data.setDate(data.getDate() - diaSemana);
  return data;
}

function estimar1RM(peso, reps) {
  if (!peso || !reps) return 0;
  if (reps === 1) return peso;
  return peso * (1 + reps / 30);
}

function calcularRecordes(treinos, ignorarData) {
  const recordes = {};
  Object.values(treinos).forEach(treino => {
    if (ignorarData && treino.data === ignorarData) return;
    (treino.series || []).forEach(serie => {
      const peso = Number(serie.peso);
      const reps = Number(serie.reps);
      const nome = (serie.exercicio || '').trim();
      if (!nome || !peso || !reps) return;
      const rm = estimar1RM(peso, reps);
      const atual = recordes[nome.toLowerCase()];
      if (!atual || rm > atual.rm) {
        recordes[nome.toLowerCase()] = { nome, peso, reps, rm, data: treino.data };
      }
    });
  });
  return recordes;
}

function detectarRecordes(treino, treinos) {
  const anteriores = calcularRecordes(treinos, treino.data);
  const novos = [];
  const melhorPorExercicio = {};

  (treino.series || []).forEach(serie => {
    const nome = (serie.exercicio || '').trim();
    const peso = Number(serie.peso);
    const reps = Number(serie.reps);
    if (!nome || !peso || !reps) return;
    const rm = estimar1RM(peso, reps);
    const chave = nome.toLowerCase();
    const anterior = anteriores[chave];
    if (anterior && rm <= anterior.rm) return;
    if (melhorPorExercicio[chave] && rm <= melhorPorExercicio[chave].rm) return;
    melhorPorExercicio[chave] = { nome, peso, reps, rm, anterior: anterior || null };
  });

  Object.values(melhorPorExercicio).forEach(pr => novos.push(pr));
  return novos;
}

function calcularEstatisticas(treinos, metaSemanal) {
  const lista = Object.values(treinos).sort((a, b) => a.data.localeCompare(b.data));
  const hoje = new Date();
  const limite = new Date(hoje.getFullYear() - 1, hoje.getMonth(), hoje.getDate());

  const noAno = lista.filter(t => dataDeChave(t.data) >= limite);

  let volume = 0;
  lista.forEach(t => {
    (t.series || []).forEach(s => {
      const peso = Number(s.peso) || 0;
      const reps = Number(s.reps) || 0;
      const series = Number(s.series) || 1;
      volume += peso * reps * series;
    });
  });

  const porGrupo = {};
  Object.keys(GRUPOS).forEach(g => { porGrupo[g] = 0; });
  const porIntensidade = [0, 0, 0, 0];
  let minutos = 0;

  noAno.forEach(t => {
    (t.grupos || []).forEach(g => { if (g in porGrupo) porGrupo[g]++; });
    const nivel = Math.min(4, Math.max(1, Number(t.intensidade) || 2));
    porIntensidade[nivel - 1]++;
    minutos += Number(t.duracao) || 0;
  });

  const { atual, recorde } = calcularSequenciaSemanal(lista, metaSemanal);

  return {
    total: noAno.length,
    totalGeral: lista.length,
    volume,
    minutos,
    porGrupo,
    porIntensidade,
    sequenciaAtual: atual,
    sequenciaRecorde: recorde
  };
}

function calcularSequenciaSemanal(lista, meta) {
  if (!lista.length) return { atual: 0, recorde: 0 };

  const porSemana = new Map();
  lista.forEach(t => {
    const chave = chaveData(inicioDaSemana(dataDeChave(t.data)));
    porSemana.set(chave, (porSemana.get(chave) || 0) + 1);
  });

  const semanaAtual = inicioDaSemana(new Date());
  const primeiraSemana = inicioDaSemana(dataDeChave(lista[0].data));

  const semanas = [];
  const cursor = new Date(primeiraSemana);
  while (cursor <= semanaAtual) {
    const chave = chaveData(cursor);
    semanas.push({ chave, treinos: porSemana.get(chave) || 0 });
    cursor.setDate(cursor.getDate() + 7);
  }

  let recorde = 0;
  let corrida = 0;
  semanas.forEach(s => {
    if (s.treinos >= meta) { corrida++; recorde = Math.max(recorde, corrida); }
    else corrida = 0;
  });

  let atual = 0;
  for (let i = semanas.length - 1; i >= 0; i--) {
    const ehSemanaCorrente = i === semanas.length - 1 && semanas[i].chave === chaveData(semanaAtual);
    if (semanas[i].treinos >= meta) atual++;
    else if (ehSemanaCorrente) continue;
    else break;
  }

  return { atual, recorde: Math.max(recorde, atual) };
}
