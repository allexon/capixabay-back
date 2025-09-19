#!/bin/bash

# deploy.sh
# Este script automatiza o processo de deploy para um ambiente específico.

# --- Validação de Segurança ---
# Garante que o script pare se qualquer comando falhar.
set -e

# --- Configuração ---
# O diretório de destino para o deploy do backend.
# Altere este caminho se necessário.
DEPLOY_TARGET_DIR="/media/HD-AUXILIAR/makertools/apps/capixabay/deploy/backend"

# --- Início do Script ---
echo "🚀 Iniciando processo de deploy para o ambiente: $1"

echo "1. Limpando o diretório de destino..."
# Cria o diretório se ele não existir e garante que esteja vazio.
mkdir -p "$DEPLOY_TARGET_DIR"
rm -rf "$DEPLOY_TARGET_DIR"/*

echo "2. Movendo os arquivos do build (da pasta 'dist') para o destino..."
# O 'shopt -s dotglob' garante que arquivos ocultos (como .env) também sejam movidos, se existirem.
shopt -s dotglob
mv dist/* "$DEPLOY_TARGET_DIR"/
shopt -u dotglob

echo "3. Copiando package.json e package-lock.json para o destino..."
cp package.json "$DEPLOY_TARGET_DIR"/
cp package-lock.json "$DEPLOY_TARGET_DIR"/

echo "4. Instalando dependências de PRODUÇÃO no destino..."
# Entra no diretório de destino, instala apenas as dependências de produção e volta.
cd "$DEPLOY_TARGET_DIR"
npm ci --omit=dev
cd - > /dev/null # Volta para o diretório anterior silenciosamente.

echo "5. Limpando a pasta 'dist' local..."
rm -rf dist

echo "✅ Deploy concluído com sucesso!"
