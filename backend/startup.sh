#!/bin/bash
echo "🔨 Instalando dependências do frontend..."
cd frontend
npm install
npm run build
cd ..

echo "🔨 Instalando dependências do backend..."
pip install -r requirements.txt

echo "🚀 Iniciando aplicação..."
python main.py
