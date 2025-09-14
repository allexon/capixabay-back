# 🔗 Gerador de QR Codes - Capixabay

Gerador automático de QR Codes para diferentes ambientes do Capixabay.

## 📁 Estrutura

```
gerador-qrcode/
├── qrcode.json              # Configuração de ambientes e empresas
├── qrcode-output/           # Arquivos gerados
│   ├── dev/                 # QR Codes para desenvolvimento
│   │   ├── qrcode-dev-png/  # Imagens PNG
│   │   ├── qrcode-dev-pdf/  # Arquivo PDF
│   │   └── qrcode-dev.html  # Visualização HTML
│   ├── prod-local/          # QR Codes para produção local
│   └── prod-nuvem/          # QR Codes para produção nuvem
├── templates/
│   └── qrcode-template.html # Template HTML
├── package.json
├── generator.js             # Script gerador
└── README.md
```

## 🚀 Como usar

### 1. Instalar dependências
```bash
cd gerador-qrcode
npm install
```

### 2. Gerar QR Codes

**Todos os ambientes:**
```bash
npm run generate
```

**Ambiente específico:**
```bash
npm run dev        # Desenvolvimento
npm run prod-local # Produção Local  
npm run prod-nuvem # Produção Nuvem
```

## 🌍 Ambientes

### DEV (Desenvolvimento)
- **Frontend:** http://192.168.0.5:5173
- **Backend:** http://192.168.0.5:3000
- **QR Code:** Para celular na rede local

### PROD LOCAL (Produção Local)
- **Frontend:** http://192.168.0.5:5173
- **Backend:** http://192.168.0.5:3001
- **QR Code:** Para celular na rede local

### PROD NUVEM (Produção Nuvem)
- **Frontend:** https://capixabay.com.br
- **Backend:** https://capixabay.com.br
- **QR Code:** Para acesso público

## 📱 URLs Geradas

Exemplo para empresa "zedogas":

**DEV:**
- Gás: `http://192.168.0.5:5173/login?acesso=qrcode&acao=comprar-gas&empresa-slug=zedogas`
- Água: `http://192.168.0.5:5173/login?acesso=qrcode&acao=comprar-agua&empresa-slug=zedogas`

**PROD NUVEM:**
- Gás: `https://capixabay.com.br/login?acesso=qrcode&acao=comprar-gas&empresa-slug=zedogas`
- Água: `https://capixabay.com.br/login?acesso=qrcode&acao=comprar-agua&empresa-slug=zedogas`

## ⚙️ Configuração

Edite `qrcode.json` para:
- Adicionar novas empresas
- Modificar URLs dos ambientes
- Adicionar novos produtos/ações

## 📄 Arquivos Gerados

Para cada ambiente:
- **PNG:** Imagens individuais dos QR Codes
- **PDF:** Documento único com todos os QR Codes
- **HTML:** Página web para visualização

## 🔧 Personalização

- **Template HTML:** Edite `templates/qrcode-template.html`
- **Configurações:** Modifique `qrcode.json`
- **Estilos:** Ajuste CSS no template