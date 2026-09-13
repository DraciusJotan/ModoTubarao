// Toast com vídeo embutido, usado pelas animações de "treino concluído" e
// "recorde pessoal". Aparece como parte da própria tela (mesmo estilo das
// faixas de aviso), nunca cobrindo o site inteiro — quem faz isso é só o splash.
const Videos = (() => {
  function mostrarToast(src, { classe = 'faixa-treino', texto = '', detalhe = '', duracao = 4000 } = {}) {
    const faixa = document.createElement('div');
    faixa.className = classe;
    faixa.setAttribute('role', 'status');

    const video = document.createElement('video');
    video.src = src;
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;

    const corpo = document.createElement('div');
    corpo.textContent = texto;
    if (detalhe) {
      const small = document.createElement('small');
      small.textContent = detalhe;
      corpo.appendChild(small);
    }

    faixa.append(video, corpo);
    document.body.appendChild(faixa);
    video.play().catch(() => {});

    setTimeout(() => faixa.remove(), duracao);
  }

  return { mostrarToast };
})();

// Splash: cobre a tela até o vídeo terminar (ou, no máximo, alguns segundos —
// pra nunca travar o app se o vídeo falhar em carregar).
function iniciarSplash() {
  const tela = document.getElementById('tela-splash');
  const video = document.getElementById('video-splash');
  if (!tela || !video) return;

  let escondido = false;
  function esconder() {
    if (escondido) return;
    escondido = true;
    tela.classList.add('escondendo');
    setTimeout(() => tela.remove(), 450);
  }

  video.addEventListener('ended', esconder);
  video.addEventListener('error', esconder);
  tela.addEventListener('click', esconder);
  setTimeout(esconder, 7000);
  video.play().catch(esconder);
}

// Aviso de "sem conexão": some sozinho quando a internet volta. Isso não
// bloqueia o app (ele já funciona offline via localStorage), é só um aviso.
function iniciarAvisoConexao() {
  const banner = document.getElementById('banner-offline');
  if (!banner) return;

  function atualizar() {
    banner.hidden = navigator.onLine;
  }

  window.addEventListener('online', atualizar);
  window.addEventListener('offline', atualizar);
  atualizar();
}
