// Backup automático — Sistema Clínica Dra. Anna Carolina Dias
// Roda via GitHub Actions (agendado), usando a service_role key do Supabase.
// Baixa TODAS as tabelas do banco e salva como JSON, uma pasta por dia.

const fs = require('fs');
const path = require('path');

const SB_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SB_URL || !SERVICE_KEY) {
  console.error('ERRO: variáveis SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas.');
  process.exit(1);
}

// Lista de tabelas — se criar uma tabela nova no banco, adicione o nome aqui também.
const TABELAS = [
  'agenda',
  'anamnese_links',
  'config_clinica',
  'config_custohorario',
  'custos_fixos',
  'custos_variaveis',
  'documentos',
  'estoque_movimentos',
  'financeiro',
  'fornecedores',
  'historico_paciente',
  'pacientes',
  'plano_itens',
  'planos_tratamento',
  'produtos',
];

const PAGE = 1000;

async function fetchAll(tabela) {
  let all = [];
  let offset = 0;
  for (;;) {
    const url = `${SB_URL}/rest/v1/${tabela}?select=*&limit=${PAGE}&offset=${offset}&order=id`;
    const res = await fetch(url, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    all = all.concat(data);
    if (data.length < PAGE) break;
    offset += PAGE;
  }
  return all;
}

async function main() {
  const hoje = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const outDir = path.join('backups', hoje);
  fs.mkdirSync(outDir, { recursive: true });

  const resumo = {};
  let erros = 0;

  for (const tabela of TABELAS) {
    process.stdout.write(`Baixando ${tabela}... `);
    try {
      const dados = await fetchAll(tabela);
      fs.writeFileSync(
        path.join(outDir, `${tabela}.json`),
        JSON.stringify(dados, null, 2)
      );
      resumo[tabela] = dados.length;
      console.log(`OK (${dados.length} registros)`);
    } catch (e) {
      resumo[tabela] = `ERRO: ${e.message}`;
      erros++;
      console.log(`ERRO: ${e.message}`);
    }
  }

  fs.writeFileSync(
    path.join(outDir, '_resumo.json'),
    JSON.stringify({ data: hoje, gerado_em: new Date().toISOString(), tabelas: resumo }, null, 2)
  );

  console.log(`\nBackup concluído em ${outDir}`);
  if (erros > 0) {
    console.error(`Atenção: ${erros} tabela(s) com erro — confira _resumo.json`);
    process.exit(1); // marca o workflow como falho para gerar alerta
  }
}

main().catch((e) => {
  console.error('Falha geral no backup:', e);
  process.exit(1);
});
