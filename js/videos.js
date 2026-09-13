// Overlay de vídeo em tela cheia, usado pelas animações de "treino concluído"
// e "recorde pessoal". Um único <video> reaproveitado pros dois casos.
const Videos = (() => {
  let overlay, video, aoFim;

  function elementos() {
    if (!overlay) {
      overlay = document.getElementById('video-overlay');
      video = document.getElementById('video-overlay-elemento');
      video.addEventListener('ended', finalizar);
      video.addEventListener('error', finalizar);
      overlay.addEventListener('click', finalizar);
    }
    return { overlay, video };
  }

  function finalizar() {
    const { overlay, video } = elementos();
    if (overlay.hidden) return;
    overlay.hidden = true;
    video.pause();
    video.removeAttribute('src');
    video.load();
    const callback = aoFim;
    aoFim = null;
    if (callback) callback();
  }

  function tocar(src, { onFim } = {}) {
    const { overlay, video } = elementos();
    aoFim = onFim || null;
    video.src = src;
    overlay.hidden = false;
    video.currentTime = 0;
    video.play().catch(() => finalizar());
  }

  return { tocar };
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
