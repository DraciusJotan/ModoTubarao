// Copia os arquivos do site (raiz do projeto) para www/, que é o webDir usado pelo Capacitor.
// Mantém index.html na raiz para o GitHub Pages continuar funcionando sem mudanças.
const fs = require('fs');
const path = require('path');

const raiz = path.resolve(__dirname, '..');
const destino = path.join(raiz, 'www');
const itens = ['index.html', 'manifest.json', 'css', 'js', 'assets'];

fs.rmSync(destino, { recursive: true, force: true });
fs.mkdirSync(destino, { recursive: true });

for (const item of itens) {
  fs.cpSync(path.join(raiz, item), path.join(destino, item), { recursive: true });
}

console.log(`www/ atualizado com: ${itens.join(', ')}`);
