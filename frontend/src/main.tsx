import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

console.log('1. main.tsx carregado');

const rootElement = document.getElementById('root');
console.log('2. Root element encontrado:', rootElement);

if (!rootElement) {
  console.error('ERRO: #root não encontrado no HTML!');
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);
console.log('3. React root criado');

window.addEventListener('error', (event) => {
  console.error('Erro global capturado:', event.error);
});

console.log('4. Renderizando App...');

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

console.log('5. App renderizado');