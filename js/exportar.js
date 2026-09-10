// Salva/compartilha arquivos gerados pelo app (backup JSON, imagem do mapa, PDF do treino).
// No navegador, um <a download> resolve. Dentro do app nativo (Capacitor) isso não faz
// nada — o WebView não tem gerenciador de downloads — então ali passamos o arquivo pro
// Filesystem (pasta de cache do app) e abrimos a folha de compartilhar nativa, de onde
// dá pra salvar em Arquivos, Drive, mandar por WhatsApp etc.
const Exportar = (() => {
  function ehNativo() {
    return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  }

  function blobParaBase64(blob) {
    return new Promise((resolve, reject) => {
      const leitor = new FileReader();
      leitor.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
      leitor.onload = () => resolve(String(leitor.result).split(',')[1]);
      leitor.readAsDataURL(blob);
    });
  }

  async function salvar(blob, nomeArquivo) {
    if (!ehNativo()) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nomeArquivo;
      link.click();
      URL.revokeObjectURL(url);
      return;
    }

    const { Filesystem, Share } = window.Capacitor.Plugins;
    const base64 = await blobParaBase64(blob);
    const arquivo = await Filesystem.writeFile({
      path: nomeArquivo,
      data: base64,
      directory: 'CACHE'
    });
    await Share.share({
      title: nomeArquivo,
      url: arquivo.uri,
      dialogTitle: 'Salvar ou compartilhar'
    });
  }

  return { ehNativo, salvar };
})();
