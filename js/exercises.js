// grupo: peito | costas | pernas | ombros | bracos | core | cardio
// equipamento: peso-corporal | halteres | barra | maquina | cabo | elastico
// nivel: iniciante | intermediario | avancado
const EXERCICIOS = [
  {
    id: 'supino-reto-barra',
    nome: 'Supino reto com barra',
    grupo: 'peito',
    equipamento: 'barra',
    nivel: 'intermediario',
    tipo: 'composto',
    musculos: 'Peitoral maior, tríceps, deltoide anterior',
    passos: [
      'Deite no banco com os pés firmes no chão e as escápulas retraídas contra o banco.',
      'Segure a barra com pegada um pouco mais aberta que a largura dos ombros.',
      'Desça a barra de forma controlada até a linha do meio do peito, mantendo os cotovelos a cerca de 45° do tronco.',
      'Empurre a barra de volta até a extensão dos cotovelos, sem travar bruscamente.'
    ],
    dicas: [
      'Mantenha os punhos alinhados com os antebraços.',
      'Use um parceiro ou os pinos de segurança ao trabalhar perto da falha.'
    ],
    erros: [
      'Quicar a barra no peito.',
      'Abrir os cotovelos a 90°, o que sobrecarrega o ombro.'
    ]
  },
  {
    id: 'supino-inclinado-halteres',
    nome: 'Supino inclinado com halteres',
    grupo: 'peito',
    equipamento: 'halteres',
    nivel: 'iniciante',
    tipo: 'composto',
    musculos: 'Peitoral superior, deltoide anterior, tríceps',
    passos: [
      'Ajuste o banco entre 30° e 45° de inclinação.',
      'Suba os halteres até a linha dos ombros com as palmas voltadas para a frente.',
      'Desça de forma controlada até sentir alongamento no peito.',
      'Empurre os halteres para cima, aproximando-os levemente no topo.'
    ],
    dicas: [
      'Inclinações acima de 45° transferem a carga para o ombro.',
      'Controle a fase excêntrica em cerca de 2 segundos.'
    ],
    erros: ['Bater os halteres um no outro no topo.', 'Arquear demais a lombar.']
  },
  {
    id: 'flexao-braco',
    nome: 'Flexão de braço',
    grupo: 'peito',
    equipamento: 'peso-corporal',
    nivel: 'iniciante',
    tipo: 'composto',
    musculos: 'Peitoral, tríceps, core',
    passos: [
      'Apoie as mãos no chão um pouco mais abertas que os ombros.',
      'Mantenha o corpo em linha reta da cabeça aos calcanhares.',
      'Desça até o peito ficar próximo ao chão, com cotovelos a 45°.',
      'Empurre o chão para voltar à posição inicial.'
    ],
    dicas: [
      'Para facilitar, apoie os joelhos ou eleve as mãos num banco.',
      'Contraia glúteos e abdômen para não deixar o quadril cair.'
    ],
    erros: ['Deixar o quadril afundar.', 'Amplitude parcial constante.']
  },
  {
    id: 'crucifixo-cabo',
    nome: 'Crossover na polia',
    grupo: 'peito',
    equipamento: 'cabo',
    nivel: 'intermediario',
    tipo: 'isolado',
    musculos: 'Peitoral maior',
    passos: [
      'Posicione as polias na altura dos ombros ou acima.',
      'Dê um passo à frente com o tronco levemente inclinado.',
      'Com cotovelos semiflexionados e fixos, aproxime as mãos à frente do corpo.',
      'Retorne controlando o alongamento do peitoral.'
    ],
    dicas: ['Pense em "abraçar" um barril.', 'Mantenha o ângulo do cotovelo constante.'],
    erros: ['Transformar o movimento em uma extensão de tríceps.', 'Usar carga que force o tronco a balançar.']
  },
  {
    id: 'mergulho-paralelas',
    nome: 'Mergulho nas paralelas',
    grupo: 'peito',
    equipamento: 'peso-corporal',
    nivel: 'avancado',
    tipo: 'composto',
    musculos: 'Peitoral inferior, tríceps, deltoide anterior',
    passos: [
      'Apoie-se nas barras paralelas com os braços estendidos.',
      'Incline o tronco levemente à frente para enfatizar o peito.',
      'Desça até os ombros ficarem na altura dos cotovelos.',
      'Empurre para cima até estender os cotovelos.'
    ],
    dicas: ['Use elástico de assistência se ainda não conseguir o peso corporal.'],
    erros: ['Descer além da mobilidade confortável do ombro.', 'Balançar as pernas para ganhar impulso.']
  },
  {
    id: 'barra-fixa',
    nome: 'Barra fixa (pegada pronada)',
    grupo: 'costas',
    equipamento: 'peso-corporal',
    nivel: 'avancado',
    tipo: 'composto',
    musculos: 'Latíssimo do dorso, bíceps, romboides',
    passos: [
      'Segure a barra com pegada pronada, um pouco mais aberta que os ombros.',
      'Inicie deprimindo as escápulas antes de flexionar os cotovelos.',
      'Puxe até o queixo passar a linha da barra.',
      'Desça de forma controlada até a extensão quase completa.'
    ],
    dicas: ['Elástico ou máquina assistida ajudam na progressão.', 'Evite balanço (kipping) em treino de hipertrofia.'],
    erros: ['Amplitude curta.', 'Puxar só com os braços, sem ativar as costas.']
  },
  {
    id: 'remada-curvada',
    nome: 'Remada curvada com barra',
    grupo: 'costas',
    equipamento: 'barra',
    nivel: 'intermediario',
    tipo: 'composto',
    musculos: 'Dorsais, romboides, trapézio, bíceps',
    passos: [
      'Em pé, incline o tronco cerca de 45° com a coluna neutra e joelhos semiflexionados.',
      'Segure a barra com pegada pronada na largura dos ombros.',
      'Puxe a barra em direção ao umbigo, aproximando as escápulas.',
      'Desça controlando até a extensão dos braços.'
    ],
    dicas: ['Mantenha o abdômen firme para proteger a lombar.'],
    erros: ['Arredondar a coluna.', 'Usar impulso do quadril a cada repetição.']
  },
  {
    id: 'puxada-frente',
    nome: 'Puxada frontal na polia',
    grupo: 'costas',
    equipamento: 'maquina',
    nivel: 'iniciante',
    tipo: 'composto',
    musculos: 'Latíssimo do dorso, bíceps',
    passos: [
      'Ajuste o apoio das coxas para não levantar do banco.',
      'Segure a barra com pegada aberta e tronco levemente inclinado para trás.',
      'Puxe a barra até a parte alta do peito, levando os cotovelos para baixo e para trás.',
      'Retorne controlando até a extensão dos braços.'
    ],
    dicas: ['Não puxe atrás da nuca — aumenta risco no ombro sem benefício extra.'],
    erros: ['Jogar o tronco para trás.', 'Soltar a barra rápido na subida.']
  },
  {
    id: 'remada-unilateral-halter',
    nome: 'Remada unilateral com halter',
    grupo: 'costas',
    equipamento: 'halteres',
    nivel: 'iniciante',
    tipo: 'composto',
    musculos: 'Dorsais, romboides, bíceps',
    passos: [
      'Apoie joelho e mão do mesmo lado no banco, coluna paralela ao chão.',
      'Segure o halter com o braço estendido.',
      'Puxe o halter em direção ao quadril, mantendo o cotovelo próximo ao corpo.',
      'Desça controlando até o alongamento completo.'
    ],
    dicas: ['Evite rotacionar o tronco para levantar mais carga.'],
    erros: ['Rodar o quadril a cada repetição.', 'Puxar em direção ao ombro em vez do quadril.']
  },
  {
    id: 'levantamento-terra',
    nome: 'Levantamento terra',
    grupo: 'costas',
    equipamento: 'barra',
    nivel: 'avancado',
    tipo: 'composto',
    musculos: 'Cadeia posterior: eretores, glúteos, isquiotibiais, trapézio',
    passos: [
      'Posicione os pés na largura do quadril com a barra sobre o meio do pé.',
      'Flexione o quadril e joelhos para segurar a barra, mantendo a coluna neutra e peito aberto.',
      'Empurre o chão com as pernas mantendo a barra rente ao corpo.',
      'Finalize estendendo o quadril, sem hiperextender a lombar.'
    ],
    dicas: ['Domine a técnica com cargas leves antes de progredir.', 'Reset a posição a cada repetição se necessário.'],
    erros: ['Arredondar a lombar.', 'Deixar a barra se afastar das canelas.']
  },
  {
    id: 'agachamento-livre',
    nome: 'Agachamento livre',
    grupo: 'pernas',
    equipamento: 'barra',
    nivel: 'intermediario',
    tipo: 'composto',
    musculos: 'Quadríceps, glúteos, adutores, core',
    passos: [
      'Apoie a barra no trapézio, pés na largura dos ombros com pontas levemente para fora.',
      'Inspire, contraia o abdômen e desça flexionando quadril e joelhos juntos.',
      'Desça até coxas paralelas ao chão ou até onde a mobilidade permitir com coluna neutra.',
      'Suba empurrando o chão, mantendo o peito erguido.'
    ],
    dicas: ['Joelhos acompanham a direção dos pés.', 'Use sapato de sola firme.'],
    erros: ['Deixar os joelhos colapsarem para dentro.', 'Subir com o quadril antes do tronco.']
  },
  {
    id: 'leg-press',
    nome: 'Leg press 45°',
    grupo: 'pernas',
    equipamento: 'maquina',
    nivel: 'iniciante',
    tipo: 'composto',
    musculos: 'Quadríceps, glúteos, isquiotibiais',
    passos: [
      'Sente-se com a lombar totalmente apoiada no encosto.',
      'Posicione os pés na plataforma na largura dos ombros.',
      'Desça controlando até cerca de 90° de flexão do joelho.',
      'Empurre a plataforma sem travar os joelhos no topo.'
    ],
    dicas: ['Pés mais altos enfatizam glúteos e posteriores.'],
    erros: ['Descolar a lombar do encosto.', 'Travar os joelhos bruscamente.']
  },
  {
    id: 'afundo',
    nome: 'Afundo (avanço)',
    grupo: 'pernas',
    equipamento: 'halteres',
    nivel: 'iniciante',
    tipo: 'composto',
    musculos: 'Quadríceps, glúteos, estabilizadores',
    passos: [
      'Em pé, segure um halter em cada mão ao lado do corpo.',
      'Dê um passo à frente e desça o joelho de trás em direção ao chão.',
      'Pare quando ambos os joelhos estiverem próximos de 90°.',
      'Empurre com a perna da frente para voltar à posição inicial.'
    ],
    dicas: ['Tronco ereto durante todo o movimento.', 'Passo curto foca quadríceps, passo longo foca glúteo.'],
    erros: ['Joelho da frente colapsando para dentro.', 'Bater o joelho de trás no chão.']
  },
  {
    id: 'stiff',
    nome: 'Stiff com barra',
    grupo: 'pernas',
    equipamento: 'barra',
    nivel: 'intermediario',
    tipo: 'composto',
    musculos: 'Isquiotibiais, glúteos, eretores da espinha',
    passos: [
      'Em pé, segure a barra à frente das coxas com joelhos levemente flexionados.',
      'Empurre o quadril para trás descendo a barra rente às pernas.',
      'Desça até sentir alongamento nos posteriores, sem perder a coluna neutra.',
      'Volte estendendo o quadril e contraindo os glúteos.'
    ],
    dicas: ['O movimento é de quadril, não de coluna.'],
    erros: ['Flexionar a lombar.', 'Transformar em agachamento dobrando muito os joelhos.']
  },
  {
    id: 'cadeira-extensora',
    nome: 'Cadeira extensora',
    grupo: 'pernas',
    equipamento: 'maquina',
    nivel: 'iniciante',
    tipo: 'isolado',
    musculos: 'Quadríceps',
    passos: [
      'Ajuste o encosto para que o joelho fique alinhado ao eixo da máquina.',
      'Posicione o rolo logo acima dos tornozelos.',
      'Estenda os joelhos de forma controlada até quase a extensão total.',
      'Retorne resistindo à descida.'
    ],
    dicas: ['Pausa de 1 segundo no topo aumenta o estímulo.'],
    erros: ['Usar impulso do tronco.', 'Soltar o peso na fase negativa.']
  },
  {
    id: 'mesa-flexora',
    nome: 'Mesa flexora',
    grupo: 'pernas',
    equipamento: 'maquina',
    nivel: 'iniciante',
    tipo: 'isolado',
    musculos: 'Isquiotibiais',
    passos: [
      'Deite de bruços com o rolo apoiado logo acima dos calcanhares.',
      'Segure as alças e mantenha o quadril colado ao apoio.',
      'Flexione os joelhos trazendo o rolo em direção aos glúteos.',
      'Desça controlando até quase a extensão.'
    ],
    dicas: ['Evite levantar o quadril para ganhar amplitude.'],
    erros: ['Movimento rápido demais.', 'Amplitude muito curta.']
  },
  {
    id: 'panturrilha-em-pe',
    nome: 'Panturrilha em pé',
    grupo: 'pernas',
    equipamento: 'maquina',
    nivel: 'iniciante',
    tipo: 'isolado',
    musculos: 'Gastrocnêmio, sóleo',
    passos: [
      'Apoie a ponta dos pés na plataforma com os calcanhares livres.',
      'Desça o calcanhar até sentir alongamento.',
      'Suba até a máxima extensão do tornozelo.',
      'Faça uma pausa curta no topo.'
    ],
    dicas: ['Amplitude completa importa mais que carga alta.'],
    erros: ['Quicar sem controle.', 'Flexionar os joelhos durante o movimento.']
  },
  {
    id: 'agachamento-livre-corporal',
    nome: 'Agachamento com peso corporal',
    grupo: 'pernas',
    equipamento: 'peso-corporal',
    nivel: 'iniciante',
    tipo: 'composto',
    musculos: 'Quadríceps, glúteos',
    passos: [
      'Pés na largura dos ombros, braços à frente para equilíbrio.',
      'Desça empurrando o quadril para trás e para baixo.',
      'Vá até onde conseguir manter os calcanhares no chão.',
      'Suba contraindo glúteos no topo.'
    ],
    dicas: ['Ótimo aquecimento antes de treinos de perna.'],
    erros: ['Levantar os calcanhares.', 'Curvar as costas na descida.']
  },
  {
    id: 'desenvolvimento-halteres',
    nome: 'Desenvolvimento com halteres',
    grupo: 'ombros',
    equipamento: 'halteres',
    nivel: 'iniciante',
    tipo: 'composto',
    musculos: 'Deltoides, tríceps, trapézio',
    passos: [
      'Sentado com encosto, segure os halteres na altura dos ombros.',
      'Mantenha os punhos firmes e o abdômen contraído.',
      'Empurre os halteres para cima até quase estender os cotovelos.',
      'Desça controlando até a altura das orelhas.'
    ],
    dicas: ['Evite arquear a lombar; se acontecer, reduza a carga.'],
    erros: ['Bater os halteres no topo.', 'Descer abaixo da amplitude confortável.']
  },
  {
    id: 'elevacao-lateral',
    nome: 'Elevação lateral',
    grupo: 'ombros',
    equipamento: 'halteres',
    nivel: 'iniciante',
    tipo: 'isolado',
    musculos: 'Deltoide medial',
    passos: [
      'Em pé, halteres ao lado do corpo com cotovelos levemente flexionados.',
      'Eleve os braços lateralmente até a altura dos ombros.',
      'Segure brevemente no topo.',
      'Desça devagar até a posição inicial.'
    ],
    dicas: ['Cargas moderadas com técnica limpa funcionam melhor aqui.'],
    erros: ['Usar impulso do tronco.', 'Elevar acima da linha dos ombros com o trapézio.']
  },
  {
    id: 'crucifixo-inverso',
    nome: 'Crucifixo inverso',
    grupo: 'ombros',
    equipamento: 'halteres',
    nivel: 'intermediario',
    tipo: 'isolado',
    musculos: 'Deltoide posterior, romboides',
    passos: [
      'Incline o tronco à frente com a coluna neutra.',
      'Deixe os halteres pendurados sob o peito.',
      'Abra os braços lateralmente até a linha dos ombros.',
      'Retorne controlando o movimento.'
    ],
    dicas: ['Pense em separar as escápulas do movimento dos braços.'],
    erros: ['Levantar o tronco durante a série.', 'Usar carga excessiva.']
  },
  {
    id: 'desenvolvimento-militar',
    nome: 'Desenvolvimento militar com barra',
    grupo: 'ombros',
    equipamento: 'barra',
    nivel: 'intermediario',
    tipo: 'composto',
    musculos: 'Deltoides, tríceps, core',
    passos: [
      'Em pé, barra apoiada na parte alta do peito com pegada na largura dos ombros.',
      'Contraia glúteos e abdômen para estabilizar o tronco.',
      'Empurre a barra para cima passando a cabeça levemente para trás.',
      'Finalize com a barra alinhada sobre o meio do corpo.'
    ],
    dicas: ['Se a mobilidade limitar, faça sentado com encosto.'],
    erros: ['Hiperextender a lombar.', 'Empurrar a barra à frente do corpo.']
  },
  {
    id: 'encolhimento',
    nome: 'Encolhimento de ombros',
    grupo: 'ombros',
    equipamento: 'halteres',
    nivel: 'iniciante',
    tipo: 'isolado',
    musculos: 'Trapézio superior',
    passos: [
      'Em pé, halteres ao lado do corpo com braços estendidos.',
      'Eleve os ombros em direção às orelhas.',
      'Pause 1 segundo no topo.',
      'Desça controlando até o alongamento.'
    ],
    dicas: ['Não role os ombros — o movimento é vertical.'],
    erros: ['Flexionar os cotovelos.', 'Amplitude mínima com carga alta.']
  },
  {
    id: 'rosca-direta',
    subgrupo: 'biceps',
    nome: 'Rosca direta',
    grupo: 'bracos',
    equipamento: 'barra',
    nivel: 'iniciante',
    tipo: 'isolado',
    musculos: 'Bíceps braquial, braquiorradial',
    passos: [
      'Em pé, segure a barra com pegada supinada na largura dos ombros.',
      'Mantenha os cotovelos fixos ao lado do tronco.',
      'Flexione os cotovelos elevando a barra até a altura do peito.',
      'Desça controlando até quase a extensão total.'
    ],
    dicas: ['Barra W reduz o estresse nos punhos.'],
    erros: ['Balançar o tronco.', 'Deixar os cotovelos irem à frente.']
  },
  {
    id: 'rosca-martelo',
    subgrupo: 'biceps',
    nome: 'Rosca martelo',
    grupo: 'bracos',
    equipamento: 'halteres',
    nivel: 'iniciante',
    tipo: 'isolado',
    musculos: 'Braquial, braquiorradial, bíceps',
    passos: [
      'Segure os halteres com pegada neutra (palmas voltadas para dentro).',
      'Mantenha os cotovelos junto ao corpo.',
      'Flexione até a altura do ombro.',
      'Desça devagar até estender os braços.'
    ],
    dicas: ['Ótimo para espessura do braço e força de pegada.'],
    erros: ['Girar o punho durante o movimento.', 'Usar impulso dos ombros.']
  },
  {
    id: 'triceps-polia',
    subgrupo: 'triceps',
    nome: 'Tríceps na polia alta',
    grupo: 'bracos',
    equipamento: 'cabo',
    nivel: 'iniciante',
    tipo: 'isolado',
    musculos: 'Tríceps braquial',
    passos: [
      'Fique de frente para a polia com a barra na altura do peito.',
      'Cotovelos fixos ao lado do tronco.',
      'Estenda os cotovelos até os braços ficarem retos.',
      'Retorne controlando até 90°.'
    ],
    dicas: ['Tronco levemente inclinado à frente melhora a estabilidade.'],
    erros: ['Afastar os cotovelos do corpo.', 'Usar o peso do corpo para empurrar.']
  },
  {
    id: 'triceps-testa',
    subgrupo: 'triceps',
    nome: 'Tríceps testa',
    grupo: 'bracos',
    equipamento: 'barra',
    nivel: 'intermediario',
    tipo: 'isolado',
    musculos: 'Tríceps braquial',
    passos: [
      'Deite no banco segurando a barra W com os braços estendidos.',
      'Mantenha os braços perpendiculares ao chão.',
      'Flexione apenas os cotovelos, descendo a barra até a testa.',
      'Estenda de volta sem mover os ombros.'
    ],
    dicas: ['Ângulo levemente para trás mantém tensão constante.'],
    erros: ['Mover os ombros junto.', 'Descer rápido demais.']
  },
  {
    id: 'rosca-concentrada',
    subgrupo: 'biceps',
    nome: 'Rosca concentrada',
    grupo: 'bracos',
    equipamento: 'halteres',
    nivel: 'iniciante',
    tipo: 'isolado',
    musculos: 'Bíceps braquial',
    passos: [
      'Sentado, apoie o cotovelo na face interna da coxa.',
      'Deixe o braço estendido segurando o halter.',
      'Flexione o cotovelo até a contração máxima.',
      'Desça lentamente até estender.'
    ],
    dicas: ['Excelente para foco na conexão mente-músculo.'],
    erros: ['Levantar o cotovelo da coxa.', 'Balançar o tronco.']
  },
  {
    id: 'mergulho-banco',
    subgrupo: 'triceps',
    nome: 'Mergulho no banco',
    grupo: 'bracos',
    equipamento: 'peso-corporal',
    nivel: 'iniciante',
    tipo: 'composto',
    musculos: 'Tríceps, deltoide anterior',
    passos: [
      'Apoie as mãos na borda de um banco com os dedos apontados para frente.',
      'Estenda as pernas à frente, apoiando os calcanhares no chão.',
      'Desça flexionando os cotovelos até cerca de 90°.',
      'Empurre para cima até estender os braços.'
    ],
    dicas: ['Joelhos dobrados deixam o exercício mais fácil.'],
    erros: ['Descer demais e forçar o ombro.', 'Afastar o quadril do banco.']
  },
  {
    id: 'prancha',
    nome: 'Prancha isométrica',
    grupo: 'core',
    equipamento: 'peso-corporal',
    nivel: 'iniciante',
    tipo: 'isolado',
    isometrico: true,
    musculos: 'Transverso do abdômen, reto abdominal, lombar',
    passos: [
      'Apoie os antebraços no chão alinhados sob os ombros.',
      'Estenda as pernas com apoio nas pontas dos pés.',
      'Mantenha o corpo em linha reta, contraindo glúteos e abdômen.',
      'Sustente pelo tempo determinado respirando normalmente.'
    ],
    dicas: ['Qualidade acima de tempo: 30s bem feitos valem mais que 2 min desalinhados.'],
    erros: ['Elevar ou afundar o quadril.', 'Prender a respiração.']
  },
  {
    id: 'abdominal-supra',
    nome: 'Abdominal supra',
    grupo: 'core',
    equipamento: 'peso-corporal',
    nivel: 'iniciante',
    tipo: 'isolado',
    musculos: 'Reto abdominal',
    passos: [
      'Deite com joelhos flexionados e pés apoiados no chão.',
      'Apoie as mãos ao lado da cabeça sem puxar o pescoço.',
      'Eleve o tronco contraindo o abdômen até as escápulas saírem do chão.',
      'Desça controlando.'
    ],
    dicas: ['Expire na subida.'],
    erros: ['Puxar a nuca com as mãos.', 'Usar impulso dos braços.']
  },
  {
    id: 'elevacao-pernas',
    nome: 'Elevação de pernas',
    grupo: 'core',
    equipamento: 'peso-corporal',
    nivel: 'intermediario',
    tipo: 'isolado',
    musculos: 'Reto abdominal inferior, flexores do quadril',
    passos: [
      'Deite com as mãos ao lado do quadril ou sob os glúteos.',
      'Mantenha as pernas estendidas e juntas.',
      'Eleve as pernas até cerca de 90° sem tirar a lombar do chão.',
      'Desça devagar até quase tocar o chão.'
    ],
    dicas: ['Se a lombar descolar, dobre um pouco os joelhos.'],
    erros: ['Descer rápido demais.', 'Arquear a lombar.']
  },
  {
    id: 'prancha-lateral',
    nome: 'Prancha lateral',
    grupo: 'core',
    equipamento: 'peso-corporal',
    nivel: 'intermediario',
    tipo: 'isolado',
    isometrico: true,
    musculos: 'Oblíquos, quadrado lombar',
    passos: [
      'Deite de lado apoiando o antebraço sob o ombro.',
      'Empilhe os pés e eleve o quadril do chão.',
      'Mantenha o corpo alinhado da cabeça aos pés.',
      'Sustente e repita do outro lado.'
    ],
    dicas: ['Apoiar o joelho de baixo reduz a dificuldade.'],
    erros: ['Deixar o quadril cair.', 'Rotacionar o tronco.']
  },
  {
    id: 'abdominal-bicicleta',
    nome: 'Abdominal bicicleta',
    grupo: 'core',
    equipamento: 'peso-corporal',
    nivel: 'iniciante',
    tipo: 'isolado',
    musculos: 'Reto abdominal, oblíquos',
    passos: [
      'Deite com as mãos ao lado da cabeça e pernas elevadas.',
      'Leve o cotovelo direito em direção ao joelho esquerdo enquanto estende a perna direita.',
      'Alterne os lados em movimento controlado.',
      'Mantenha a lombar apoiada no chão.'
    ],
    dicas: ['Velocidade moderada gera mais tensão que movimento acelerado.'],
    erros: ['Puxar o pescoço.', 'Fazer rápido demais sem contrair.']
  },
  {
    id: 'corrida',
    nome: 'Corrida contínua',
    grupo: 'cardio',
    equipamento: 'peso-corporal',
    nivel: 'iniciante',
    tipo: 'cardio',
    musculos: 'Sistema cardiovascular, pernas',
    passos: [
      'Comece com 5 minutos de caminhada para aquecer.',
      'Mantenha um ritmo em que consiga conversar com alguma dificuldade.',
      'Sustente o ritmo pelo tempo programado.',
      'Finalize com 5 minutos de caminhada leve.'
    ],
    dicas: ['Aumente o volume semanal em no máximo 10% por semana.'],
    erros: ['Começar rápido demais.', 'Ignorar a progressão gradual.']
  },
  {
    id: 'hiit-bike',
    nome: 'HIIT na bike',
    grupo: 'cardio',
    equipamento: 'maquina',
    nivel: 'intermediario',
    tipo: 'cardio',
    musculos: 'Sistema cardiovascular, quadríceps',
    passos: [
      'Aqueça por 5 minutos em ritmo leve.',
      'Pedale 30 segundos em intensidade alta.',
      'Recupere por 60 a 90 segundos em ritmo leve.',
      'Repita de 6 a 10 ciclos e finalize com 5 minutos leves.'
    ],
    dicas: ['Ótimo quando o tempo é curto.', 'Limite a 2 ou 3 sessões por semana.'],
    erros: ['Pular o aquecimento.', 'Fazer todos os dias e prejudicar a recuperação.']
  },
  {
    id: 'burpee',
    nome: 'Burpee',
    grupo: 'cardio',
    equipamento: 'peso-corporal',
    nivel: 'intermediario',
    tipo: 'cardio',
    musculos: 'Corpo inteiro, sistema cardiovascular',
    passos: [
      'Em pé, agache e apoie as mãos no chão.',
      'Jogue os pés para trás chegando à posição de prancha.',
      'Faça uma flexão (opcional) e retorne os pés para perto das mãos.',
      'Salte para cima estendendo o corpo.'
    ],
    dicas: ['Sem o salto, vira uma versão de baixo impacto.'],
    erros: ['Deixar o quadril cair na prancha.', 'Aterrissar com os joelhos travados.']
  },
  {
    id: 'pular-corda',
    nome: 'Pular corda',
    grupo: 'cardio',
    equipamento: 'peso-corporal',
    nivel: 'iniciante',
    tipo: 'cardio',
    musculos: 'Panturrilhas, sistema cardiovascular',
    passos: [
      'Ajuste a corda: pisando no meio, as alças devem chegar às axilas.',
      'Mantenha os cotovelos próximos ao corpo, girando pelos punhos.',
      'Salte apenas o suficiente para a corda passar.',
      'Aterrisse na ponta dos pés com joelhos levemente flexionados.'
    ],
    dicas: ['Alterne 1 minuto pulando e 30 segundos de descanso.'],
    erros: ['Saltar alto demais.', 'Girar a corda com os ombros.']
  },
  {
    id: 'remada-elastico',
    nome: 'Remada com elástico',
    grupo: 'costas',
    equipamento: 'elastico',
    nivel: 'iniciante',
    tipo: 'composto',
    musculos: 'Dorsais, romboides, bíceps',
    passos: [
      'Prenda o elástico na altura do peito ou pise nele sentado com as pernas estendidas.',
      'Segure as pontas com os braços estendidos.',
      'Puxe em direção ao abdômen, aproximando as escápulas.',
      'Retorne controlando a tensão.'
    ],
    dicas: ['Ótima opção para treino em casa ou viagem.'],
    erros: ['Deixar o elástico voltar sem controle.', 'Encolher os ombros durante a puxada.']
  },
  {
    id: 'agachamento-bulgaro',
    nome: 'Agachamento búlgaro',
    grupo: 'pernas',
    equipamento: 'halteres',
    nivel: 'intermediario',
    tipo: 'composto',
    musculos: 'Quadríceps, glúteos, estabilizadores',
    passos: [
      'Apoie o peito do pé de trás em um banco atrás de você.',
      'Dê um passo suficiente à frente com a perna da frente.',
      'Desça verticalmente até o joelho da frente chegar perto de 90°.',
      'Suba empurrando com o calcanhar da frente.'
    ],
    dicas: ['Tronco levemente inclinado à frente aumenta a participação do glúteo.'],
    erros: ['Passo curto demais, sobrecarregando o joelho.', 'Perder o equilíbrio por falta de apoio.']
  },
  {
    id: 'elevacao-frontal-elastico',
    nome: 'Elevação frontal com elástico',
    grupo: 'ombros',
    equipamento: 'elastico',
    nivel: 'iniciante',
    tipo: 'isolado',
    musculos: 'Deltoide anterior',
    passos: [
      'Pise no meio do elástico com os pés na largura do quadril.',
      'Segure as pontas com os braços estendidos à frente das coxas.',
      'Eleve os braços até a altura dos ombros.',
      'Desça controlando a tensão do elástico.'
    ],
    dicas: ['Elástico mais curto aumenta a resistência.'],
    erros: ['Balançar o tronco.', 'Elevar acima da linha dos ombros.']
  },
  {
    id: 'face-pull',
    nome: 'Face pull na polia',
    grupo: 'ombros',
    equipamento: 'cabo',
    nivel: 'iniciante',
    tipo: 'isolado',
    musculos: 'Deltoide posterior, rotadores externos, trapézio médio',
    passos: [
      'Ajuste a polia na altura do rosto com uma corda.',
      'Segure a corda com pegada neutra e dê um passo para trás.',
      'Puxe a corda em direção ao rosto, separando as mãos.',
      'Finalize com os cotovelos altos e escápulas retraídas.'
    ],
    dicas: ['Excelente para saúde do ombro e postura em quem treina muito peito.'],
    erros: ['Usar carga alta e transformar em remada alta.', 'Deixar os cotovelos caírem.']
  }
];

const GRUPOS = {
  peito: 'Peito',
  costas: 'Costas',
  pernas: 'Pernas',
  ombros: 'Ombros',
  bracos: 'Braços',
  core: 'Core',
  cardio: 'Cardio'
};

const EQUIPAMENTOS = {
  'peso-corporal': 'Peso corporal',
  halteres: 'Halteres',
  barra: 'Barra',
  maquina: 'Máquina',
  cabo: 'Cabo/Polia',
  elastico: 'Elástico'
};

const NIVEIS = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado'
};
