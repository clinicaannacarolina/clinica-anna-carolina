-- Amplia a função já existente (criada antes, pra corrigir o acesso anônimo)
-- para também devolver os dados da clínica (nome, CRO, telefone, logo),
-- assim a tela de Anamnese mostra o cabeçalho certo pra cada clínica.
drop function if exists dados_paciente_anamnese(text);

create or replace function dados_paciente_anamnese(p_token text)
returns table(
  nome text, apelido text, telefone text, data_nascimento date, cpf text, rg text, sexo text, endereco text,
  clinica_nome text, clinica_especialidade text, clinica_registro text, clinica_telefone text, clinica_logo text, clinica_endereco text
)
language sql
security definer
stable
as $$
  select p.nome, p.apelido, p.telefone, p.data_nascimento, p.cpf, p.rg, p.sexo, p.endereco,
         cc.nome, cc.especialidade, cc.registro_profissional, cc.telefone, cc.logo_url, cc.endereco
  from pacientes p
  join anamnese_links al on al.paciente_id = p.id
  join config_clinica cc on cc.clinica_id = al.clinica_id
  where al.token = p_token
  limit 1
$$;

grant execute on function dados_paciente_anamnese(text) to anon;
