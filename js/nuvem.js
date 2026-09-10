// Autenticação e sincronização com a nuvem (Firebase Auth + Firestore).
// Se js/firebase-config.js ainda não tiver as chaves reais, o app continua
// funcionando 100% no localStorage, só sem sincronizar entre aparelhos.
const Nuvem = (() => {
  const configValido = typeof FIREBASE_CONFIG !== 'undefined' && FIREBASE_CONFIG.apiKey !== 'COLE_AQUI';

  let auth = null;
  let db = null;
  let usuarioAtual = null;
  let timerSalvar = null;

  if (configValido && window.firebase) {
    firebase.initializeApp(FIREBASE_CONFIG);
    auth = firebase.auth();
    db = firebase.firestore();
  }

  const MENSAGENS_ERRO = {
    'auth/email-already-in-use': 'Já existe uma conta com esse e-mail.',
    'auth/invalid-email': 'E-mail inválido.',
    'auth/weak-password': 'Senha muito fraca. Use pelo menos 8 caracteres.',
    'auth/user-not-found': 'Não encontrei conta com esse e-mail.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/too-many-requests': 'Muitas tentativas. Espere um pouco e tente de novo.',
    'auth/network-request-failed': 'Sem conexão com a internet.',
    'auth/requires-recent-login': 'Por segurança, faça login de novo antes de repetir essa ação.'
  };

  function mensagemErro(codigo) {
    return MENSAGENS_ERRO[codigo] || 'Não foi possível completar. Tente de novo.';
  }

  function cadastrar(email, senha) {
    if (!configValido) return Promise.reject(new Error('Sincronização não configurada.'));
    return auth.createUserWithEmailAndPassword(email, senha);
  }

  function entrar(email, senha) {
    if (!configValido) return Promise.reject(new Error('Sincronização não configurada.'));
    return auth.signInWithEmailAndPassword(email, senha);
  }

  function sair() {
    if (!configValido) return Promise.resolve();
    return auth.signOut();
  }

  function docDoUsuario(uid) {
    return db.collection('usuarios').doc(uid);
  }

  function docDoPerfil(uid) {
    return db.collection('perfis').doc(uid);
  }

  function carregarNuvem(uid) {
    return docDoUsuario(uid).get().then(snap => (snap.exists ? snap.data() : null));
  }

  function carregarPerfil(uid) {
    return docDoPerfil(uid).get().then(snap => (snap.exists ? snap.data() : null));
  }

  function salvarPerfil(perfil) {
    if (!configValido || !usuarioAtual) return Promise.reject(new Error('Sincronização não configurada.'));
    return docDoPerfil(usuarioAtual.uid).set(perfil);
  }

  function alterarSenha(senhaAtual, novaSenha) {
    if (!configValido || !usuarioAtual) return Promise.reject(new Error('Sincronização não configurada.'));
    const credencial = firebase.auth.EmailAuthProvider.credential(usuarioAtual.email, senhaAtual);
    return usuarioAtual.reauthenticateWithCredential(credencial)
      .then(() => usuarioAtual.updatePassword(novaSenha));
  }

  function recuperarSenha(email) {
    if (!configValido) return Promise.reject(new Error('Sincronização não configurada.'));
    return auth.sendPasswordResetEmail(email);
  }

  // Apaga os dados na nuvem antes da conta, porque as regras do Firestore
  // só permitem escrever enquanto o uid ainda está autenticado.
  function excluirConta(senha) {
    if (!configValido || !usuarioAtual) return Promise.reject(new Error('Sincronização não configurada.'));
    const credencial = firebase.auth.EmailAuthProvider.credential(usuarioAtual.email, senha);
    return usuarioAtual.reauthenticateWithCredential(credencial)
      .then(() => Promise.all([
        docDoUsuario(usuarioAtual.uid).delete(),
        docDoPerfil(usuarioAtual.uid).delete()
      ]))
      .then(() => usuarioAtual.delete());
  }

  // Debounced: evita gravar a cada tecla/edição rápida em sequência.
  function salvarNuvem(dados) {
    if (!configValido || !usuarioAtual) return;
    clearTimeout(timerSalvar);
    timerSalvar = setTimeout(() => {
      docDoUsuario(usuarioAtual.uid).set(dados)
        .catch(e => console.warn('Não foi possível sincronizar com a nuvem:', e));
    }, 800);
  }

  function iniciar({ aoLogar, aoDeslogar }) {
    if (!configValido) return;
    auth.onAuthStateChanged(usuario => {
      usuarioAtual = usuario;
      if (usuario) aoLogar(usuario);
      else aoDeslogar();
    });
  }

  return {
    configValido, cadastrar, entrar, sair, carregarNuvem, salvarNuvem, iniciar, mensagemErro,
    carregarPerfil, salvarPerfil, excluirConta, alterarSenha, recuperarSenha
  };
})();
