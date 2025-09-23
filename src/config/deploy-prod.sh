#!/bin/bash

# deploy-prod.sh
# Este script automatiza o processo de deploy de forma inteligente para o ambiente de PRODUÇÃO.

# --- Validação de Segurança ---
set -e

# --- Configuração ---
# O diretório onde o build será preparado antes de ser enviado para a AWS
DEPLOY_DIR="/media/HD-AUXILIAR/makertools/apps/capixabay/deploy"
DEPLOY_TARGET_DIR="$DEPLOY_DIR/backend"
ENV_SOURCE_FILE=".env.prod" # O arquivo .env.prod está na raiz do projeto.

# --- Início do Script ---
echo "🚀 Iniciando processo de deploy inteligente para PRODUÇÃO..."

# --- LÓGICA DE VERIFICAÇÃO DE DEPENDÊNCIAS ---
NEEDS_NPM_INSTALL=false

if ! cmp -s "package.json" "$DEPLOY_TARGET_DIR/package.json"; then
    echo "💡 Detectada mudança no package.json. A reinstalação de dependências será necessária."
    NEEDS_NPM_INSTALL=true
else
    echo "✅ package.json não foi alterado. Pulando a reinstalação de dependências."
fi

echo "1. Limpando o diretório de destino (exceto node_modules)..."
mkdir -p "$DEPLOY_TARGET_DIR"
find "$DEPLOY_TARGET_DIR" -mindepth 1 -maxdepth 1 ! -name "node_modules" -exec rm -rf {} +

echo "2. Movendo os arquivos do build (da pasta 'dist') para o destino..."
mv dist/* "$DEPLOY_TARGET_DIR"/

echo "3. Copiando package.json e package-lock.json para o destino..."
cp package.json "$DEPLOY_TARGET_DIR"/
cp package-lock.json "$DEPLOY_TARGET_DIR"/

echo "4. Copiando o arquivo de ambiente para a pasta de deploy..."
cp "$ENV_SOURCE_FILE" "$DEPLOY_DIR/"

if [ "$NEEDS_NPM_INSTALL" = true ]; then
    echo "5. Instalando dependências de PRODUÇÃO no destino..."
    cd "$DEPLOY_TARGET_DIR"
    npm ci --omit=dev
    cd - > /dev/null
else
    echo "5. Pulando instalação de dependências."
fi

echo "6. Limpando a pasta 'dist' local..."
rm -rf dist

echo "✅ Deploy prod concluído com sucesso!"