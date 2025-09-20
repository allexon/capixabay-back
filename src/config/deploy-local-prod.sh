#!/bin/bash

# deploy.sh
# Este script automatiza o processo de deploy de forma inteligente.

# --- Validação de Segurança ---
set -e

# --- Configuração ---
DEPLOY_DIR="/media/HD-AUXILIAR/makertools/apps/capixabay/deploy"
DEPLOY_TARGET_DIR="$DEPLOY_DIR/backend/local-prod"
ENV_SOURCE_FILE=".env.local-prod"

# --- Início do Script ---
echo "🚀 Iniciando processo de deploy inteligente..."

# --- LÓGICA DE VERIFICAÇÃO DE DEPENDÊNCIAS ---
# Variável para controlar se precisamos reinstalar os módulos.
NEEDS_NPM_INSTALL=false

# Verifica se o package.json de destino existe e é diferente do de origem.
# Se o arquivo não existir no destino ou se for diferente, precisamos instalar.
if ! cmp -s "package.json" "$DEPLOY_TARGET_DIR/package.json"; then
    echo "💡 Detectada mudança no package.json. A reinstalação de dependências será necessária."
    NEEDS_NPM_INSTALL=true
else
    echo "✅ package.json não foi alterado. Pulando a reinstalação de dependências."
fi
# --- FIM DA LÓGICA DE VERIFICAÇÃO ---

echo "1. Limpando o diretório de destino (exceto node_modules)..."
# Cria o diretório se ele não existir.
mkdir -p "$DEPLOY_TARGET_DIR"
# Apaga tudo, EXCETO a pasta node_modules, para preservá-la.
find "$DEPLOY_TARGET_DIR" -mindepth 1 -maxdepth 1 ! -name "node_modules" -exec rm -rf {} +

echo "2. Movendo os arquivos do build (da pasta 'dist') para o destino..."
mv dist/* "$DEPLOY_TARGET_DIR"/

echo "3. Copiando package.json e package-lock.json para o destino..."
cp package.json "$DEPLOY_TARGET_DIR"/
cp package-lock.json "$DEPLOY_TARGET_DIR"/

echo "4. Copiando o arquivo de ambiente para a pasta de deploy..."
cp "$ENV_SOURCE_FILE" "$DEPLOY_DIR/"

# Só executa o 'npm ci' se a flag NEEDS_NPM_INSTALL for verdadeira.
if [ "$NEEDS_NPM_INSTALL" = true ]; then
    echo "5. Instalando dependências de PRODUÇÃO no destino..."
    cd "$DEPLOY_TARGET_DIR"
    # 'npm ci' é a melhor opção aqui, pois garante uma instalação limpa baseada no lockfile.
    npm ci --omit=dev
    cd - > /dev/null
else
    echo "5. Pulando instalação de dependências."
fi

echo "6. Limpando a pasta 'dist' local..."
rm -rf dist

echo "✅ Deploy concluído com sucesso!"
