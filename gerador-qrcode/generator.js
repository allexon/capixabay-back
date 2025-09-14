const fs = require('fs');
const path = require('path');
const QRCodeWithLogo = require('qrcode-with-logos');
const { createCanvas } = require('canvas');

class QRCodeGenerator {
    constructor() {
        this.config = JSON.parse(fs.readFileSync('./qrcode.json', 'utf8'));
        this.outputDir = './qrcode-output';
        this.produtosPadrao = [
            { acao: 'comprar-gas', descricao: 'Gás de Cozinha' },
            { acao: 'comprar-agua', descricao: 'Água Mineral' }
        ];
    }

    // Gerar nome da empresa baseado no slug
    gerarNomeEmpresa(empresaSlug) {
        // Capitalizar primeira letra e adicionar "do Gás" se não for capixabay
        const nome = empresaSlug.charAt(0).toUpperCase() + empresaSlug.slice(1);
        return empresaSlug === 'capixabay' ? 'Capixabay' : `${nome.replace('dogas', ' do Gás').replace('gas', ' Gás')}`;
    }

    // Processar empresas simples em formato completo
    processarEmpresas() {
        return this.config.empresas.map(empresaSlug => ({
            empresa_slug: empresaSlug,
            empresa_nome: this.gerarNomeEmpresa(empresaSlug),
            produtos: this.produtosPadrao
        }));
    }

    // Gerar URL completa
    gerarURL(ambiente, empresaSlug, acao) {
        const baseURL = this.config.ambientes[ambiente].frontend_url;
        return `${baseURL}/login?acesso=qrcode&acao=${acao}&empresa-slug=${empresaSlug}`;
    }

    // Criar logo personalizado
    async criarLogo(empresaNome, produtoTipo) {
        const canvas = createCanvas(80, 80);
        const ctx = canvas.getContext('2d');
        
        // Fundo branco
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 80, 80);
        
        // Borda
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, 80, 80);
        
        // Ícone
        const icone = produtoTipo === 'comprar-gas' ? '🔥' : '💧';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#000000';
        ctx.fillText(icone, 40, 25);
        
        // Nome da empresa
        ctx.font = 'bold 8px Arial';
        const nomeFormatado = empresaNome.toUpperCase().replace(' DO GÁS', '').replace('GÁS', '');
        ctx.fillText(nomeFormatado, 40, 40);
        
        // Tipo do produto
        const produtoTexto = produtoTipo === 'comprar-gas' ? 'GÁS' : 'ÁGUA';
        ctx.fillText(produtoTexto, 40, 55);
        
        return canvas.toBuffer('image/png');
    }
    
    // Gerar QR Code PNG com logo
    async gerarQRCodePNG(url, filename, empresaNome, produtoTipo) {
        try {
            // Criar logo personalizado
            const logoBuffer = await this.criarLogo(empresaNome, produtoTipo);
            const logoPath = filename.replace('.png', '_logo.png');
            fs.writeFileSync(logoPath, logoBuffer);
            
            // Gerar QR code com logo
            const qrCodeWithLogo = new QRCodeWithLogo({
                canvas: createCanvas(300, 300),
                content: url,
                width: 300,
                logo: {
                    src: logoPath,
                    logoRadius: 8,
                    logoSize: 0.15,
                    borderRadius: 8,
                    borderSize: 2,
                    borderColor: '#000000'
                }
            });
            
            await qrCodeWithLogo.toFile(filename);
            
            // Remover arquivo temporário do logo
            fs.unlinkSync(logoPath);
            
            return true;
        } catch (error) {
            console.error(`Erro ao gerar QR Code PNG: ${error}`);
            return false;
        }
    }

    // Criar estrutura de diretórios
    criarDiretorios() {
        const ambientes = Object.keys(this.config.ambientes);
        const dirs = [];
        
        ambientes.forEach(ambiente => {
            dirs.push(`${this.outputDir}/${ambiente}`);
            dirs.push(`${this.outputDir}/${ambiente}/qrcode-${ambiente}-png`);
        });
        
        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    // Gerar todos os QR codes e HTMLs
    async gerarTodos() {
        console.log('🚀 Gerando QR Codes para todos os ambientes...');
        
        // Criar diretórios
        this.criarDiretorios();
        
        const todasUrls = {};
        const ambientes = Object.keys(this.config.ambientes);
        
        // Processar empresas
        const empresasProcessadas = this.processarEmpresas();
        
        // Gerar QR codes para cada ambiente
        for (const ambiente of ambientes) {
            todasUrls[ambiente] = [];
            
            for (const empresa of empresasProcessadas) {
                for (const produto of empresa.produtos) {
                    const url = this.gerarURL(ambiente, empresa.empresa_slug, produto.acao);
                    const filename = `${empresa.empresa_slug}-${produto.acao}.png`;
                    const filepath = `${this.outputDir}/${ambiente}/qrcode-${ambiente}-png/${filename}`;
                    
                    // Gerar QR Code PNG com logo personalizado
                    await this.gerarQRCodePNG(url, filepath, empresa.empresa_nome, produto.acao);
                    
                    todasUrls[ambiente].push({
                        empresa: empresa.empresa_nome,
                        empresa_slug: empresa.empresa_slug,
                        produto: produto.descricao,
                        acao: produto.acao,
                        url: url
                    });
                }
            }
            
            // Gerar HTML individual para cada ambiente
            await this.gerarHTML(ambiente, todasUrls[ambiente]);
        }
        
        // Gerar HTML consolidado com todos os ambientes
        await this.gerarHTMLConsolidado(todasUrls);
        
        // Mostrar lista organizada por empresa
        this.mostrarListaOrganizada(todasUrls);
        
        return todasUrls;
    }

    // Gerar HTML com QR codes
    async gerarHTML(ambiente, urls) {
        let empresasHTML = '';
        
        // Agrupar por empresa
        const porEmpresa = {};
        urls.forEach(item => {
            if (!porEmpresa[item.empresa]) {
                porEmpresa[item.empresa] = [];
            }
            porEmpresa[item.empresa].push(item);
        });
        
        Object.keys(porEmpresa).forEach(empresaNome => {
            let qrcodesHTML = '';
            
            porEmpresa[empresaNome].forEach(item => {
                const filename = `${item.empresa_slug}-${item.acao}.png`;
                qrcodesHTML += `
                    <div class="qrcode-item">
                        <h4>${item.produto}</h4>
                        <img src="./qrcode-${ambiente}-png/${filename}" alt="QR Code ${item.produto}">
                        <div class="url-info">${item.url}</div>
                    </div>
                `;
            });
            
            empresasHTML += `
                <div class="empresa">
                    <h2 class="empresa-titulo">${empresaNome}</h2>
                    <div class="qrcode-grid">
                        ${qrcodesHTML}
                    </div>
                </div>
            `;
        });

        // Carregar template
        const template = fs.readFileSync('./templates/qrcode-template.html', 'utf8');
        
        // Substituir variáveis
        const html = template
            .replace(/{{AMBIENTE}}/g, this.config.ambientes[ambiente].name)
            .replace(/{{AMBIENTE_CLASS}}/g, ambiente)
            .replace(/{{DATA_GERACAO}}/g, new Date().toLocaleString('pt-BR'))
            .replace(/{{EMPRESAS_HTML}}/g, empresasHTML);

        // Salvar HTML
        const htmlPath = `${this.outputDir}/${ambiente}/qrcode-${ambiente}.html`;
        fs.writeFileSync(htmlPath, html);
        
        console.log(`✅ HTML gerado: ${htmlPath}`);
    }

    // Gerar HTML consolidado com todos os ambientes
    async gerarHTMLConsolidado(todasUrls) {
        const empresasProcessadas = this.processarEmpresas();
        
        // Cabeçalho da tabela
        let tabelaHTML = `
            <table class="qrcode-table">
                <thead>
                    <tr>
                        <th>EMPRESA</th>
                        <th>PRODUTO</th>
                        <th>DEV</th>
                        <th>PROD LOCAL</th>
                        <th>PROD NUVEM</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        empresasProcessadas.forEach(empresa => {
            const produtos = empresa.produtos;
            
            produtos.forEach((produto, produtoIndex) => {
                tabelaHTML += '<tr>';
                
                // Nome da empresa (só na primeira linha)
                if (produtoIndex === 0) {
                    tabelaHTML += `<td class="empresa-nome" rowspan="${produtos.length}">${empresa.empresa_nome}</td>`;
                }
                
                // Nome do produto
                tabelaHTML += `<td class="produto-nome">${produto.descricao}</td>`;
                
                // QR codes para cada ambiente
                Object.keys(this.config.ambientes).forEach(ambiente => {
                    const empresaUrls = todasUrls[ambiente].filter(item => 
                        item.empresa_slug === empresa.empresa_slug && item.acao === produto.acao
                    );
                    
                    if (empresaUrls.length > 0) {
                        const item = empresaUrls[0];
                        const filename = `${item.empresa_slug}-${item.acao}.png`;
                        const icone = item.acao === 'comprar-gas' ? '🔥' : '💧';
                        const empresaNome = item.empresa.replace(' do Gás', '').replace('Gás', '').toUpperCase();
                        tabelaHTML += `
                            <td class="qrcode-cell">
                                <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px; color: #2c3e50;">
                                    ${icone} ${empresaNome}
                                </div>
                                <div style="font-size: 12px; margin-bottom: 8px; color: #7f8c8d;">
                                    ${item.produto}
                                </div>
                                <img src="./${ambiente}/qrcode-${ambiente}-png/${filename}" alt="QR Code ${item.produto}">
                                <div class="url-info">${item.url}</div>
                            </td>
                        `;
                    } else {
                        tabelaHTML += '<td class="qrcode-cell">-</td>';
                    }
                });
                
                tabelaHTML += '</tr>';
            });
        });
        
        tabelaHTML += '</tbody></table>';

        // Carregar template
        const template = fs.readFileSync('./templates/qrcode-template.html', 'utf8');
        
        // Substituir variáveis
        const html = template
            .replace(/{{AMBIENTE}}/g, 'TODOS OS AMBIENTES')
            .replace(/{{AMBIENTE_CLASS}}/g, 'consolidado')
            .replace(/{{DATA_GERACAO}}/g, new Date().toLocaleString('pt-BR'))
            .replace(/{{EMPRESAS_HTML}}/g, tabelaHTML);

        // Salvar HTML consolidado
        const htmlPath = `${this.outputDir}/qrcode-consolidado.html`;
        fs.writeFileSync(htmlPath, html);
        
        console.log(`✅ HTML consolidado gerado: ${htmlPath}`);
    }

    // Mostrar lista organizada por empresa
    mostrarListaOrganizada(todasUrls) {
        console.log('\n' + '='.repeat(100));
        console.log('📱 LISTA COMPLETA DE QR CODES (para celular)');
        console.log('='.repeat(100));
        
        const empresasProcessadas = this.processarEmpresas();
        
        empresasProcessadas.forEach(empresa => {
            console.log(`\n    --- ${empresa.empresa_nome.toUpperCase()} ----`);
            
            Object.keys(this.config.ambientes).forEach(ambiente => {
                const ambienteNome = ambiente === 'dev' ? 'DEV' : 
                                   ambiente === 'prod-local' ? 'PROD LOCAL' : 'PROD NUVEM';
                
                console.log(`        **** (${ambienteNome}) *******`);
                
                const empresaUrls = todasUrls[ambiente].filter(item => 
                    item.empresa_slug === empresa.empresa_slug
                );
                
                empresaUrls.forEach(item => {
                    const produtoNome = item.acao === 'comprar-gas' ? 'GAS' : 'AGUA';
                    console.log(`            ${produtoNome.padEnd(8)} -> ${item.url}`);
                });
                
                if (ambiente !== 'prod-nuvem') console.log('');
            });
        });
    }
}

// Executar
async function main() {
    const generator = new QRCodeGenerator();
    await generator.gerarTodos();
    
    console.log('\n🎉 Geração completa!');
    console.log('📁 Arquivos salvos em: ./qrcode-output/');
    console.log('🌐 Abra os arquivos HTML no navegador para ver os QR codes!');
}

main().catch(console.error);